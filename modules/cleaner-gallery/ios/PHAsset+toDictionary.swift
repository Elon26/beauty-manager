import Photos

extension PHAsset {
  func toDictionary() -> [String: Any] {
    var dict: [String: Any] = [:]

    dict["id"] = self.localIdentifier
    dict["uri"] = "ph://" + self.localIdentifier
    dict["createdAt"] = self.creationDate?.timeIntervalSince1970 ?? -1
    dict["updatedAt"] = self.modificationDate?.timeIntervalSince1970 ?? -1
    dict["type"] = self.mediaType.rawValue
    dict["duration"] = self.duration
    dict["width"] = self.pixelWidth
    dict["height"] = self.pixelHeight
    dict["favorite"] = self.isFavorite
    dict["hidden"] = self.isHidden
    dict["location"] = [
      "latitude": self.location?.coordinate.latitude ?? 0.0,
      "longitude": self.location?.coordinate.longitude ?? 0.0,
    ]

    if let resources = PHAssetResource.assetResources(for: self).first {
      dict["size"] = resources.value(forKey: "fileSize") as? Int64 ?? 0
      dict["name"] = resources.originalFilename
    } else {
      dict["size"] = 0
      dict["name"] = ""
    }

    return dict
  }
}
