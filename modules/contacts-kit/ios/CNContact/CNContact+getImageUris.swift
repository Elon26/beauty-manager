import Contacts
import Foundation
import UIKit

extension CNContact {
  /// Saves contact images to the app's temporary directory and returns file URIs
  /// - Checks if images already exist and only writes if needed
  /// - Creates unique folders based on contact identifier
  /// - Returns paths that can be used directly in React Native
  func getImageUris() -> (thumbnail: String?, fullImage: String?) {
    let fileManager = FileManager.default
    let tempDirectory = NSTemporaryDirectory()
    let contactsDirectory = tempDirectory.appending("contact_images/")

    do {
      if !fileManager.fileExists(atPath: contactsDirectory) {
        try fileManager.createDirectory(
          atPath: contactsDirectory, withIntermediateDirectories: true)
      }
    } catch {
      print("Error creating directories: \(error)")
      return (nil, nil)
    }

    var thumbnailUri: String? = nil
    var fullImageUri: String? = nil

    if self.isKeyAvailable(CNContactThumbnailImageDataKey),
      let thumbnailData = self.thumbnailImageData
    {
      let thumbnailPath = contactsDirectory.appending("\(self.identifier)_thumbnail.jpg")
      let thumbnailUrl = URL(fileURLWithPath: thumbnailPath)

      let shouldWrite =
        !fileManager.fileExists(atPath: thumbnailPath)
        || (try? Data(contentsOf: thumbnailUrl)) != thumbnailData

      if shouldWrite {
        do {
          try thumbnailData.write(to: thumbnailUrl)
        } catch {
          print("Error saving thumbnail: \(error)")
        }
      }

      thumbnailUri = "file://\(thumbnailPath)"
    }

    if self.isKeyAvailable(CNContactImageDataKey), let imageData = self.imageData {
      let imagePath = contactsDirectory.appending("\(self.identifier)_fullimage.jpg")
      let imageUrl = URL(fileURLWithPath: imagePath)

      let shouldWrite =
        !fileManager.fileExists(atPath: imagePath) || (try? Data(contentsOf: imageUrl)) != imageData

      if shouldWrite {
        do {
          try imageData.write(to: imageUrl)
        } catch {
          print("Error saving full image: \(error)")
        }
      }

      fullImageUri = "file://\(imagePath)"
    }

    return (thumbnailUri, fullImageUri)
  }
}
