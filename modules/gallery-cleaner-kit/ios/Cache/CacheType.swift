import Foundation

enum CacheType {
  case hash
  case aestheticScore
  case blurScore

  var storageKey: String {
    switch self {
    case .hash: return "hashes"
    case .aestheticScore: return "aestheticScores"
    case .blurScore: return "blurScores"
    }
  }
}
