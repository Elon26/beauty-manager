import Photos

struct DuplicateGroup {
  let id: UUID
  let assets: [PHAsset]

  func toDictionary() -> [String: Any] {
    [
      "id": id.uuidString,
      "assets": assets.map { $0.localIdentifier },
    ]
  }

  func sorted(with scores: [String: Float]) -> Self {
    Self(
      id: id,
      assets: assets.sorted { scores[$0.localIdentifier] ?? 0 > scores[$1.localIdentifier] ?? 0 }
    )
  }
}
