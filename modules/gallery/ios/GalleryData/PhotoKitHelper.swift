import Photos
import UIKit

final class PhotoKitHelper {

  static let shared = PhotoKitHelper()

  private init() {}

  // MARK: - Permission Management

  func requestPhotoLibraryPermission(completion: @escaping (Bool) -> Void) {
    let status = PHPhotoLibrary.authorizationStatus(for: .readWrite)

    switch status {
    case .authorized, .limited:
      completion(true)
    case .denied, .restricted:
      completion(false)
    case .notDetermined:
      PHPhotoLibrary.requestAuthorization(for: .readWrite) { newStatus in
        DispatchQueue.main.async {
          completion(newStatus == .authorized || newStatus == .limited)
        }
      }
    @unknown default:
      completion(false)
    }
  }

  // MARK: - Asset Fetching

  func fetchAsset(from localIdentifier: String) -> PHAsset? {
    let fetchResult = PHAsset.fetchAssets(withLocalIdentifiers: [localIdentifier], options: nil)
    return fetchResult.firstObject
  }

  func fetchImage(
    for asset: PHAsset,
    targetSize: CGSize,
    completion: @escaping (UIImage?) -> Void
  ) -> PHImageRequestID {
    let options = PHImageRequestOptions()
    options.deliveryMode = .opportunistic
    options.resizeMode = .fast
    options.isNetworkAccessAllowed = true
    options.isSynchronous = false

    return PHImageManager.default().requestImage(
      for: asset,
      targetSize: targetSize,
      contentMode: .aspectFill,
      options: options
    ) { image, _ in
      DispatchQueue.main.async {
        completion(image)
      }
    }
  }

}
