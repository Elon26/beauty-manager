import CoreVideo
import Metal
import MetalPerformanceShaders

/// GPU-accelerated blur detection using Laplacian variance method
final class BlurCalculatorGPU {
  private let device: MTLDevice
  private let commandQueue: MTLCommandQueue
  private var textureCache: CVMetalTextureCache!

  // Metal Performance Shaders filters
  private let toGrayscale: MPSImageConversion
  private let gaussianBlur: MPSImageGaussianBlur
  private let laplacian: MPSImageLaplacian
  private let statistics: MPSImageStatisticsMeanAndVariance

  init?(blurSigma: Float = 1.0) {
    // Setup Metal device and queue
    guard let device = MTLCreateSystemDefaultDevice(),
      MPSSupportsMTLDevice(device),
      let queue = device.makeCommandQueue()
    else { return nil }

    self.device = device
    self.commandQueue = queue

    // Create texture cache for CVPixelBuffer conversion
    CVMetalTextureCacheCreate(kCFAllocatorDefault, nil, device, nil, &textureCache)

    // Configure color conversion (sRGB → linear grayscale)
    let srcColorSpace = CGColorSpace(name: CGColorSpace.sRGB)!
    let dstColorSpace = CGColorSpace(name: CGColorSpace.linearGray)!

    toGrayscale = MPSImageConversion(
      device: device,
      srcAlpha: .alphaIsOne,
      destAlpha: .alphaIsOne,
      backgroundColor: nil,
      conversionInfo: .init(src: srcColorSpace, dst: dstColorSpace)
    )

    // Configure filters
    gaussianBlur = MPSImageGaussianBlur(device: device, sigma: blurSigma)
    laplacian = MPSImageLaplacian(device: device)
    statistics = MPSImageStatisticsMeanAndVariance(device: device)

    // Prevent edge artifacts
    gaussianBlur.edgeMode = .clamp
    laplacian.edgeMode = .clamp
  }

  /// Calculates blur score for an image (higher = sharper, lower = blurrier)
  /// Algorithm: Laplacian of Gaussian (LoG) variance method
  /// Calculates blur score for an image (higher = sharper, lower = blurrier)
  /// Algorithm: Laplacian of Gaussian (LoG) variance method
  func calculateBlurScore(_ pixelBuffer: CVPixelBuffer) async -> Float? {
    let width = CVPixelBufferGetWidth(pixelBuffer)
    let height = CVPixelBufferGetHeight(pixelBuffer)
    let pixelCount = width * height

    // Create Metal texture from pixel buffer
    guard let sourceTexture = createTexture(from: pixelBuffer) else {
      return nil
    }

    // Create intermediate textures
    guard let grayscaleTexture = createFloatTexture(width: width, height: height),
      let blurredTexture = createFloatTexture(width: width, height: height),
      let laplacianTexture = createFloatTexture(width: width, height: height),
      let statsTexture = createStatsTexture()
    else {
      return nil
    }

    // Create command buffer
    guard let commandBuffer = commandQueue.makeCommandBuffer() else {
      return nil
    }

    // Encode GPU operations pipeline:
    // 1. Convert BGRA to grayscale
    toGrayscale.encode(
      commandBuffer: commandBuffer,
      sourceTexture: sourceTexture,
      destinationTexture: grayscaleTexture
    )

    // 2. Apply Gaussian blur
    gaussianBlur.encode(
      commandBuffer: commandBuffer,
      sourceTexture: grayscaleTexture,
      destinationTexture: blurredTexture
    )

    // 3. Apply Laplacian edge detection
    laplacian.encode(
      commandBuffer: commandBuffer,
      sourceTexture: blurredTexture,
      destinationTexture: laplacianTexture
    )

    // 4. Calculate mean and variance
    statistics.encode(
      commandBuffer: commandBuffer,
      sourceTexture: laplacianTexture,
      destinationTexture: statsTexture
    )

    // Wait for completion and read results
    return await withCheckedContinuation { continuation in
      commandBuffer.addCompletedHandler { _ in
        let variance = self.readVariance(from: statsTexture, pixelCount: pixelCount)
        continuation.resume(returning: variance)
      }

      // Commit after setting up the completion handler
      commandBuffer.commit()
    }
  }

  /// Converts CGImage to CVPixelBuffer for Metal processing
  func convertToPixelBuffer(_ cgImage: CGImage, size: CGSize) -> CVPixelBuffer? {
    let attributes: [CFString: Any] = [
      kCVPixelBufferMetalCompatibilityKey: true,
      kCVPixelBufferCGImageCompatibilityKey: true,
      kCVPixelBufferCGBitmapContextCompatibilityKey: true,
      kCVPixelBufferIOSurfacePropertiesKey: [:] as CFDictionary,
    ]

    var pixelBuffer: CVPixelBuffer?
    let status = CVPixelBufferCreate(
      kCFAllocatorDefault,
      Int(size.width),
      Int(size.height),
      kCVPixelFormatType_32BGRA,
      attributes as CFDictionary,
      &pixelBuffer
    )

    guard status == kCVReturnSuccess, let buffer = pixelBuffer else {
      return nil
    }

    CVPixelBufferLockBaseAddress(buffer, [])
    defer { CVPixelBufferUnlockBaseAddress(buffer, []) }

    guard let baseAddress = CVPixelBufferGetBaseAddress(buffer) else {
      return nil
    }

    let bytesPerRow = CVPixelBufferGetBytesPerRow(buffer)
    let colorSpace = CGColorSpace(name: CGColorSpace.sRGB) ?? CGColorSpaceCreateDeviceRGB()
    let bitmapInfo =
      CGImageAlphaInfo.premultipliedFirst.rawValue | CGBitmapInfo.byteOrder32Little.rawValue

    guard
      let context = CGContext(
        data: baseAddress,
        width: Int(size.width),
        height: Int(size.height),
        bitsPerComponent: 8,
        bytesPerRow: bytesPerRow,
        space: colorSpace,
        bitmapInfo: bitmapInfo
      )
    else {
      return nil
    }

    // Fast rendering (quality not critical for blur detection)
    context.interpolationQuality = .low
    context.setAllowsAntialiasing(false)

    // Draw image
    context.clear(CGRect(origin: .zero, size: size))
    context.draw(cgImage, in: CGRect(origin: .zero, size: size))

    return buffer
  }

  // MARK: - Private Helpers

  private func createTexture(from pixelBuffer: CVPixelBuffer) -> MTLTexture? {
    let width = CVPixelBufferGetWidth(pixelBuffer)
    let height = CVPixelBufferGetHeight(pixelBuffer)

    var cvTexture: CVMetalTexture?
    let status = CVMetalTextureCacheCreateTextureFromImage(
      kCFAllocatorDefault,
      textureCache,
      pixelBuffer,
      nil,
      .bgra8Unorm,
      width,
      height,
      0,
      &cvTexture
    )

    guard status == kCVReturnSuccess,
      let metalTexture = cvTexture,
      let texture = CVMetalTextureGetTexture(metalTexture)
    else {
      return nil
    }

    return texture
  }

  private func createFloatTexture(width: Int, height: Int) -> MTLTexture? {
    let descriptor = MTLTextureDescriptor.texture2DDescriptor(
      pixelFormat: .r16Float,
      width: width,
      height: height,
      mipmapped: false
    )
    descriptor.usage = [.shaderRead, .shaderWrite]
    descriptor.storageMode = .private

    return device.makeTexture(descriptor: descriptor)
  }

  private func createStatsTexture() -> MTLTexture? {
    let descriptor = MTLTextureDescriptor.texture2DDescriptor(
      pixelFormat: .r32Float,
      width: 2,
      height: 1,
      mipmapped: false
    )
    descriptor.usage = [.shaderRead, .shaderWrite]
    descriptor.storageMode = .shared

    return device.makeTexture(descriptor: descriptor)
  }

  private func readVariance(from texture: MTLTexture, pixelCount: Int) -> Float? {
    var results = [Float](repeating: 0, count: 2)
    let region = MTLRegionMake2D(0, 0, 2, 1)

    texture.getBytes(
      &results,
      bytesPerRow: 2 * MemoryLayout<Float>.size,
      from: region,
      mipmapLevel: 0
    )

    let variance = results[1]  // Index 1 contains variance (σ²)

    // Apply Bessel's correction for sample standard deviation
    let n = max(2, pixelCount)
    let correctionFactor = Float(n) / Float(n - 1)
    let standardDeviation = sqrt(max(0, variance) * correctionFactor)

    return standardDeviation
  }
}
