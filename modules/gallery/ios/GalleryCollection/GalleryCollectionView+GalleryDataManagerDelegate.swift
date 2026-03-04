extension GalleryCollectionView: GalleryDataManagerDelegate {

  func galleryDataManager(_ manager: GalleryDataManager, didUpdateData data: GalleryData) {
    applySnapshot(animatingDifferences: true)
  }

  func galleryDataManager(_ manager: GalleryDataManager, didClearData data: GalleryData) {
    applySnapshot(animatingDifferences: true)
  }

}
