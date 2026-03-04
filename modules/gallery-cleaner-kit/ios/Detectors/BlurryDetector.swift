import Photos
import UIKit

/// Detects blurry images in the photo library using GPU-accelerated analysis
final class BlurryDetector {
  private let thumbnailSize: CGFloat = 256
  private let maxConcurrentTasks = 4
  private let blurCalculator: BlurCalculatorGPU?

  init() {
    self.blurCalculator = BlurCalculatorGPU()
  }

  // (lower = more blurry)
  func findBlurryImages(threshold: Float = 3.5) async -> [(asset: PHAsset, score: Float)] {
    // Request photo library access
    guard await requestPhotoAccess() else {
      print("❌ Photo library access denied")
      return []
    }

    guard let calculator = blurCalculator else {
      print("❌ GPU blur calculator failed to initialize")
      return []
    }

    let assets = fetchAllImages()
    let results = await processImages(assets, threshold: threshold, calculator: calculator)
    return results
  }

  func calculateBlurScore(for asset: PHAsset) async -> Float? {
    guard let calculator = blurCalculator else { return nil }

    guard let image = await loadImage(from: asset),
      let pixelBuffer = calculator.convertToPixelBuffer(
        image,
        size: CGSize(width: thumbnailSize, height: thumbnailSize)
      )
    else {
      return nil
    }

    return await calculator.calculateBlurScore(pixelBuffer)
  }

  // MARK: - Private Helpers

  private func requestPhotoAccess() async -> Bool {
    let status = await PHPhotoLibrary.requestAuthorization(for: .readWrite)
    return status == .authorized
  }

  private func fetchAllImages() -> [PHAsset] {
    let options = PHFetchOptions()
    options.sortDescriptors = [NSSortDescriptor(key: "creationDate", ascending: false)]
    options.includeAssetSourceTypes = [.typeUserLibrary]

    let results = PHAsset.fetchAssets(with: .image, options: options)
    return results.objects(at: IndexSet(integersIn: 0..<results.count))
  }

  private func loadImage(from asset: PHAsset) async -> CGImage? {
    let options = PHImageRequestOptions()
    options.isNetworkAccessAllowed = false
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
        if let img {
          let cgImage = img.cgImage
          cont.resume(returning: cgImage)
        } else {
          cont.resume(returning: nil)
        }
      }
    }
    return image
  }

  private func processImages(
    _ assets: [PHAsset],
    threshold: Float,
    calculator: BlurCalculatorGPU
  ) async -> [(asset: PHAsset, score: Float)] {
    await withTaskGroup(of: (PHAsset, Float)?.self) { group in
      var blurryImages: [(asset: PHAsset, score: Float)] = []
      var index = 0

      // Start initial batch
      for _ in 0..<min(maxConcurrentTasks, assets.count) {
        let currentIndex = index  // Capture the current value
        group.addTask {
          await self.analyzeImage(
            assets[currentIndex], threshold: threshold, calculator: calculator)
        }
        index += 1
      }

      // Process results and queue remaining tasks
      for await result in group {
        if let result = result {
          blurryImages.append(result)
        }

        // Queue next task
        if index < assets.count {
          let currentIndex = index  // Capture the current value
          group.addTask {
            await self.analyzeImage(
              assets[currentIndex], threshold: threshold, calculator: calculator)
          }
          index += 1
        }
      }

      // Sort by creation date (newest first)
      return blurryImages.sorted { asset1, asset2 in
        (asset1.asset.creationDate ?? .distantPast) > (asset2.asset.creationDate ?? .distantPast)
      }
    }
  }

  private func analyzeImage(
    _ asset: PHAsset,
    threshold: Float,
    calculator: BlurCalculatorGPU
  ) async -> (PHAsset, Float)? {
    guard let image = await loadImage(from: asset) else {
      return nil
    }

    guard
      let pixelBuffer = calculator.convertToPixelBuffer(
        image,
        size: CGSize(width: thumbnailSize, height: thumbnailSize)
      )
    else {
      return nil
    }

    guard let score = await calculator.calculateBlurScore(pixelBuffer) else {
      return nil
    }

    let scoreNormalized = score * 1e2
    if scoreNormalized < threshold && scoreNormalized > 0 {
      // print("📷 Blurry image: score=\(String(format: "%.4f", scoreNormalized))")
      return (asset, score)
    }

    return nil
  }

}
