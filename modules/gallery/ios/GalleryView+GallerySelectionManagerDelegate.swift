extension GalleryView: GallerySelectionManagerDelegate {

  func gallerySelectionManager(
    _ manager: GallerySelectionManager, didSelectItem indexPath: IndexPath
  ) {
    if let item = dataManager?.item(at: indexPath.section, index: indexPath.item) {
      didSelectItem([
        "id": item,
        "indexPath": [
          "section": indexPath.section,
          "item": indexPath.item,
        ],
      ])
    }
  }

  func gallerySelectionManager(
    _ manager: GallerySelectionManager, didDeselectItem indexPath: IndexPath
  ) {
    if let item = dataManager?.item(at: indexPath.section, index: indexPath.item) {
      didDeselectItem([
        "id": item,
        "indexPath": [
          "section": indexPath.section,
          "item": indexPath.item,
        ],
      ])
    }
  }

  func gallerySelectionManager(
    _ manager: GallerySelectionManager, didChangeSelection selection: Set<IndexPath>
  ) {
    var items: [[String: Any]] = []
    for indexPath in selection {
      if let item = dataManager?.item(at: indexPath.section, index: indexPath.item) {
        items.append([
          "id": item,
          "indexPath": [
            "section": indexPath.section,
            "item": indexPath.item,
          ],
        ])
      }
    }
    didChangeSelection(["selection": items])
  }

  func gallerySelectionManager(_ manager: GallerySelectionManager, didClearSelection: Void) {
    self.didClearSelection()
  }
}
