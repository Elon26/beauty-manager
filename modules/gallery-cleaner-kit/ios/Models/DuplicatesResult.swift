import Foundation
import Photos

struct DuplicatesResult: Sendable {
  let similarPhotoGroups: [DuplicateGroup]
  let aestheticsScores: [String: Float]
  let blurScores: [String: Float]
  let blurryImages: [String: Float]

  func toDictionary() -> [String: Any] {
    [
      "similarPhotoGroups": similarPhotoGroups.map { $0.toDictionary() },
      "aestheticsScores": aestheticsScores,
      "blurScores": blurScores,
      "blurryImages": blurryImages,
    ]
  }

  init() {
    similarPhotoGroups = []
    aestheticsScores = [:]
    blurScores = [:]
    blurryImages = [:]
  }

  init(from mutable: MutableDuplicatesResult) {
    self.similarPhotoGroups = mutable.similarPhotoGroups
    self.aestheticsScores = mutable.aestheticsScores
    self.blurScores = mutable.blurScores
    self.blurryImages = mutable.blurryImages
  }

  func mutableCopy() -> MutableDuplicatesResult {
    var mutable = MutableDuplicatesResult()
    mutable.similarPhotoGroups = similarPhotoGroups
    mutable.aestheticsScores = aestheticsScores
    mutable.blurScores = blurScores
    mutable.blurryImages = blurryImages
    return mutable
  }
}

struct MutableDuplicatesResult {
  var similarPhotoGroups: [DuplicateGroup]
  var aestheticsScores: [String: Float]
  var blurScores: [String: Float]
  var blurryImages: [String: Float]

  init() {
    similarPhotoGroups = []
    aestheticsScores = [:]
    blurScores = [:]
    blurryImages = [:]
  }

  func freeze() -> DuplicatesResult {
    DuplicatesResult(from: self)
  }
}
