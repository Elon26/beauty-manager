struct ImageHash: Hashable, Sendable {
  let data: Data
  let thumbnailSize: Int

  private enum ColorLevel: UInt8 {
    case black = 0
    case darkGray = 1
    case lightGray = 2
    case white = 3
  }

  init(data: Data, thumbnailSize: Int) {
    self.data = data
    self.thumbnailSize = thumbnailSize
  }

  init(fromGrayscale pixelData: [UInt8], thumbnailSize: Int) {
    let totalPixels = thumbnailSize * thumbnailSize
    let totalBits = totalPixels * 2
    let totalBytes = (totalBits + 7) / 8  // Round up to nearest byte
    var hashBytes = [UInt8](repeating: 0, count: totalBytes)

    for (index, pixel) in pixelData.enumerated() {
      guard index < totalPixels else { break }

      let level: ColorLevel =
        switch pixel {
        case 0..<64: .black
        case 64..<128: .darkGray
        case 128..<192: .lightGray
        default: .white
        }

      let bitPosition = index * 2
      let byteIndex = bitPosition / 8
      let bitOffset = bitPosition % 8

      hashBytes[byteIndex] |= (level.rawValue << bitOffset)
    }

    self.data = Data(hashBytes)
    self.thumbnailSize = thumbnailSize
  }

  init(fromRGB pixelData: [UInt8], thumbnailSize: Int) {
    let totalPixels = thumbnailSize * thumbnailSize
    let totalBits = totalPixels * 3  // 1 bit per R, G, B
    let totalBytes = (totalBits + 7) / 8
    var hashBytes = [UInt8](repeating: 0, count: totalBytes)

    for index in 0..<totalPixels {
      let base = index * 4  // assuming RGBA pixel buffer (R,G,B,A)
      let r = pixelData[base]
      let g = pixelData[base + 1]
      let b = pixelData[base + 2]

      // Quantize each channel to 1 bit
      let rBit: UInt8 = r >= 128 ? 1 : 0
      let gBit: UInt8 = g >= 128 ? 1 : 0
      let bBit: UInt8 = b >= 128 ? 1 : 0

      // Pack as [R,G,B] → 3 bits
      let pixelBits: UInt8 = (rBit << 2) | (gBit << 1) | bBit

      let bitPosition = index * 3
      let byteIndex = bitPosition / 8
      let bitOffset = bitPosition % 8

      if bitOffset <= 5 {
        hashBytes[byteIndex] |= pixelBits << bitOffset
      } else {
        // Split across byte boundary
        hashBytes[byteIndex] |= pixelBits << bitOffset
        hashBytes[byteIndex + 1] |= pixelBits >> (8 - bitOffset)
      }
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
