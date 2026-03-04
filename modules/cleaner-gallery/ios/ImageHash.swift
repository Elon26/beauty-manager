struct ImageHash: Hashable, Sendable {
  private let data: Data
  let thumbnailSize: Int

  private init(data: Data, thumbnailSize: Int) {
    self.data = data
    self.thumbnailSize = thumbnailSize
  }

  init(from pixelData: [UInt8], thumbnailSize: Int) {
    let totalPixels = thumbnailSize * thumbnailSize
    let totalBits = totalPixels * 2
    let totalBytes = (totalBits + 7) / 8  // Round up to nearest byte
    var hashBytes = [UInt8](repeating: 0, count: totalBytes)

    for (index, pixel) in pixelData.enumerated() {
      guard index < totalPixels else { break }

      let level: UInt8 =
        switch pixel {
        case 0..<64: 0
        case 64..<128: 1
        case 128..<192: 2
        default: 3
        }

      let bitPosition = index * 2
      let byteIndex = bitPosition / 8
      let bitOffset = bitPosition % 8

      hashBytes[byteIndex] |= (level << bitOffset)
    }

    self.data = Data(hashBytes)
    self.thumbnailSize = thumbnailSize
  }

  static func ^ (lhs: ImageHash, rhs: ImageHash) -> ImageHash {
    guard lhs.thumbnailSize == rhs.thumbnailSize else {
      // Return a hash with all bits set to 1 if sizes don't match
      return ImageHash(
        data: Data(repeating: 0xff, count: lhs.data.count), thumbnailSize: lhs.thumbnailSize)
    }
    let xorData = Data(zip(lhs.data, rhs.data).map { $0 ^ $1 })
    return ImageHash(data: xorData, thumbnailSize: lhs.thumbnailSize)
  }

  static func == (lhs: ImageHash, rhs: ImageHash) -> Bool {
    guard lhs.thumbnailSize == rhs.thumbnailSize else {
      return false
    }
    return lhs.data == rhs.data
  }

  var bitCount: Int {
    return data.reduce(0) { $0 + Int($1.nonzeroBitCount) }
  }

  var isEmpty: Bool {
    return data.isEmpty
  }

  static func empty(for thumbnailSize: Int) -> ImageHash {
    return ImageHash(data: Data(), thumbnailSize: thumbnailSize)
  }
}
