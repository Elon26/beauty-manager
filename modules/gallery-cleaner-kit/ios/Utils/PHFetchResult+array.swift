import Photos

extension PHFetchResult<PHAsset> {
  func array() -> [PHAsset] {
    self.objects(at: IndexSet(integersIn: 0..<self.count))
  }

  func ids() -> [String] {
    self.array().map({ $0.localIdentifier })
  }
}
