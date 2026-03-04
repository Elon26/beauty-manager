import Foundation

/// Factory for creating and managing typed cache instances
final class CacheFactory {
  static let shared = CacheFactory()

  private init() {}

  // MARK: - Cache Instances

  private(set) lazy var hashCache: Cache<ImageHash> = {
    Cache<ImageHash>(name: "hashes_v4", storageKey: "hashes1")
  }()

  private(set) lazy var aestheticScoreCache: Cache<Float> = {
    Cache<Float>(name: "aesthetic_scores_v4", storageKey: "aestheticScores1")
  }()

  private(set) lazy var blurScoreCache: Cache<Float> = {
    Cache<Float>(name: "blur_scores_v4", storageKey: "blurScores1")
  }()

  // MARK: - Helper Methods

  func getCache(for type: CacheType) -> Any {
    switch type {
    case .hash:
      return hashCache
    case .aestheticScore:
      return aestheticScoreCache
    case .blurScore:
      return blurScoreCache
    }
  }

  func invalidateAll(for identifier: String) async {
    await hashCache.invalidate(identifier: identifier)
    await aestheticScoreCache.invalidate(identifier: identifier)
    await blurScoreCache.invalidate(identifier: identifier)
  }

  func clearAll() async {
    await hashCache.removeAll()
    await aestheticScoreCache.removeAll()
    await blurScoreCache.removeAll()
  }
}
