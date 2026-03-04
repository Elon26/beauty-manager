import Foundation

protocol CacheValue: Sendable {
  func serialize() -> Any
  static func deserialize(from data: Any) -> Self?
}

extension ImageHash: CacheValue {
  func serialize() -> Any {
    return [
      "data": data.base64EncodedString(),
      "thumbnailSize": thumbnailSize,
    ] as [String: Any]
  }

  static func deserialize(from data: Any) -> ImageHash? {
    guard let dict = data as? [String: Any],
      let dataString = dict["data"] as? String,
      let hashData = Data(base64Encoded: dataString),
      let thumbnailSize = dict["thumbnailSize"] as? Int
    else {
      return nil
    }
    return ImageHash(data: hashData, thumbnailSize: thumbnailSize)
  }
}

extension Float: CacheValue {
  func serialize() -> Any {
    return Double(self)
  }

  static func deserialize(from data: Any) -> Float? {
    if let doubleValue = data as? Double {
      return Float(doubleValue)
    } else if let floatValue = data as? Float {
      return floatValue
    }
    return nil
  }
}
