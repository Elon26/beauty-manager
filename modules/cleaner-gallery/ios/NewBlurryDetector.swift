import CoreImage
import ImageIO
import Metal
import Photos
import UIKit

final class NewBlurryDetector {

  private let thumbnailSize: CGFloat = 256
  private let contextQueue = DispatchQueue(label: "com.blurrydetector.context", qos: .utility)

  init() {}

  private func createContext() -> CIContext? {
    guard let device = MTLCreateSystemDefaultDevice() else { return nil }

    guard let colorSpace = CGColorSpace(name: CGColorSpace.sRGB) else { return nil }

    return CIContext(
      mtlDevice: device,
      options: [
        .workingColorSpace: colorSpace,
        .outputColorSpace: colorSpace,
        .workingFormat: CIFormat.RGBA8,  // Use RGBA8 for compatibility
      ])
  }

  /// Returns a sharpness score (higher = sharper)
  func sharpnessScore(for image: CIImage) -> Float? {
    // Create a new context for each call to ensure thread safety
    guard let context = createContext() else { return nil }

    var ci = image

    // Linear luminance
    ci = ci.applyingFilter("CISRGBToneCurveToLinear")
    guard
      let luma = CIFilter(
        name: "CIColorMatrix",
        parameters: [
          kCIInputImageKey: ci,
          "inputRVector": CIVector(x: 0.2126, y: 0, z: 0, w: 0),
          "inputGVector": CIVector(x: 0, y: 0.7152, z: 0, w: 0),
          "inputBVector": CIVector(x: 0, y: 0, z: 0.0722, w: 0),
          "inputAVector": CIVector(x: 0, y: 0, z: 0, w: 1),
          "inputBiasVector": CIVector(x: 0, y: 0, z: 0, w: 0),
        ])?.outputImage
    else { return nil }

    // Laplacian 3x3
    let kernel: [CGFloat] = [
      -1, -1, -1,
      -1, 8, -1,
      -1, -1, -1,
    ]
    guard
      let lap = CIFilter(
        name: "CIConvolution3X3",
        parameters: [
          kCIInputImageKey: luma,
          "inputWeights": CIVector(values: kernel, count: 9),
          "inputBias": 0,
        ])?.outputImage
    else { return nil }

    // Clamp to [-1, 1] to avoid negative values killing GPU filters
    let clamped = lap.applyingFilter(
      "CIColorClamp",
      parameters: [
        "inputMinComponents": CIVector(x: -1, y: -1, z: -1, w: 0),
        "inputMaxComponents": CIVector(x: 1, y: 1, z: 1, w: 1),
      ])

    // Square Laplacian on GPU
    guard
      let squared = CIFilter(
        name: "CIColorPolynomial",
        parameters: [
          kCIInputImageKey: clamped,
          "inputRedCoefficients": CIVector(x: 0, y: 0, z: 1, w: 0),
          "inputGreenCoefficients": CIVector(x: 0, y: 0, z: 1, w: 0),
          "inputBlueCoefficients": CIVector(x: 0, y: 0, z: 1, w: 0),
          "inputAlphaCoefficients": CIVector(x: 0, y: 1, z: 0, w: 0),
        ])?.outputImage
    else { return nil }

    // Mean of squared Laplacian
    return areaAverage_Rf(squared, context: context)
  }

  func sharpnessScore(for asset: PHAsset) async -> Float? {
    let options = PHImageRequestOptions()
    options.isNetworkAccessAllowed = true
    options.isSynchronous = false
    options.version = .current
    options.resizeMode = .fast
    options.deliveryMode = .highQualityFormat

    let image = await withCheckedContinuation { cont in
      PHImageManager.default().requestImage(
        for: asset,
        targetSize: CGSize(width: self.thumbnailSize, height: self.thumbnailSize),
        contentMode: .aspectFill,
        options: options
      ) { img, _ in
        if let img = img {
          cont.resume(returning: CIImage(image: img))
        } else {
          cont.resume(returning: nil)
        }
      }
    }
    guard let image else { return nil }
    let score = sharpnessScore(for: image)
    return score
  }

  func sharpnessScore(for assetId: String) async -> Float? {
    let asset = PHAsset.fetchAssets(withLocalIdentifiers: [assetId], options: nil).firstObject
    guard let asset else { return nil }
    return await sharpnessScore(for: asset)
  }

  private func areaAverage_Rf(_ image: CIImage, context: CIContext) -> Float? {
    let extent = image.extent

    // Check if extent is valid (not infinite or empty)
    guard !extent.isInfinite && !extent.isEmpty && extent.width > 0 && extent.height > 0 else {
      return nil
    }

    guard
      let avg = CIFilter(
        name: "CIAreaAverage",
        parameters: [
          kCIInputImageKey: image,
          kCIInputExtentKey: CIVector(cgRect: extent),
        ])?.outputImage
    else { return nil }

    var r: Float = 0
    context.render(
      avg, toBitmap: &r,
      rowBytes: MemoryLayout<Float>.size,
      bounds: CGRect(x: 0, y: 0, width: 1, height: 1),
      format: .Rf, colorSpace: nil)
    return r * (1e6)
  }

  func findBlurryImages(threshold: Float = 3.5) async -> [(asset: PHAsset, score: Float)] {
    let status = await PHPhotoLibrary.requestAuthorization(for: .readWrite)
    guard status == .authorized else { return [] }

    let fetchOptions = PHFetchOptions()
    fetchOptions.sortDescriptors = [NSSortDescriptor(key: "creationDate", ascending: false)]
    fetchOptions.includeAssetSourceTypes = [.typeUserLibrary]

    let fetchResult = PHAsset.fetchAssets(with: .image, options: fetchOptions)
    let assets = fetchResult.objects(at: IndexSet(integersIn: 0..<fetchResult.count))

    var blurryAssets: [(asset: PHAsset, score: Float)] = []

    // Limit concurrency to avoid overwhelming the system
    await withTaskGroup(
      of: (PHAsset, Float)?.self,
      body: { [weak self] group in
        var activeTaskCount = 0
        let maxConcurrentTasks = min(4, ProcessInfo.processInfo.activeProcessorCount)

        for asset in assets {
          // Wait for a task slot to become available
          while activeTaskCount >= maxConcurrentTasks {
            if let result = await group.next() {
              activeTaskCount -= 1
              if let result = result {
                blurryAssets.append(result)
              }
            }
          }

          group.addTask { [weak self] in
            let score = await self?.sharpnessScore(for: asset)
            guard let score else { return nil }

            if score < threshold {
              return (asset, score)
            } else {
              return nil
            }
          }
          activeTaskCount += 1
        }

        // Collect remaining results
        while activeTaskCount > 0 {
          if let result = await group.next() {
            activeTaskCount -= 1
            if let result = result {
              blurryAssets.append(result)
            }
          }
        }
      })

    blurryAssets.sort {
      ($0.asset.creationDate ?? Date.distantPast) > ($1.asset.creationDate ?? Date.distantPast)
    }

    return blurryAssets
  }
}
