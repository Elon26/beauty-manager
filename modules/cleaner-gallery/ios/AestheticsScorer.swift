import CoreImage
import Photos
import UIKit
import Vision

@available(iOS 18.0, *)
final class AestheticsScorer {

  private let thumbnailSize: CGFloat = 256

  init() {}

  /// Returns an aesthetics score (higher = better)
  func aestheticsScore(for image: CIImage, orientation: CGImagePropertyOrientation = .up) async
    -> Float?
  {
    let request = VNCalculateImageAestheticsScoresRequest()
    let handler = VNImageRequestHandler(ciImage: image, orientation: orientation)

    do {
      try handler.perform([request])
      guard let observation = request.results?.first else {
        return nil
      }
      return observation.overallScore
    } catch {
      print("Failed to perform aesthetics request: \(error)")
      return nil
    }
  }

  func aestheticsScore(for asset: PHAsset) async -> Float? {
    let options = PHImageRequestOptions()
    options.isNetworkAccessAllowed = true
    options.isSynchronous = false
    options.version = .current
    options.resizeMode = .fast
    options.deliveryMode = .highQualityFormat

    let (image, orientation): (CIImage?, CGImagePropertyOrientation?) =
      await withCheckedContinuation { cont in
        PHImageManager.default().requestImage(
          for: asset,
          targetSize: CGSize(width: self.thumbnailSize, height: self.thumbnailSize),
          contentMode: .aspectFill,
          options: options
        ) { img, _ in
          if let img = img {
            cont.resume(returning: (CIImage(image: img), img.imageOrientation.cgOrientation))
          } else {
            cont.resume(returning: (nil, nil))
          }
        }
      }
    guard let image else { return nil }
    let score = await aestheticsScore(for: image, orientation: orientation ?? .up)
    return score
  }

  func aestheticsScore(for assetId: String) async -> Float? {
    let asset = PHAsset.fetchAssets(withLocalIdentifiers: [assetId], options: nil).firstObject
    guard let asset else { return nil }
    return await aestheticsScore(for: asset)
  }
}
