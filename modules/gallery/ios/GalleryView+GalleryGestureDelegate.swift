extension GalleryView: GalleryGestureDelegate {
  func galleryGestureDelegate(
    didTap indexPath: IndexPath
  ) {
    guard let galleryItem = galleryView?.item(at: indexPath) else { return }
    guard let section = galleryView?.section(at: indexPath.section) else { return }
    didTapItem([
      "id": galleryItem.uri,
      "indexPath": [
        "section": indexPath.section,
        "item": indexPath.item,
      ],
      "section": section.assets,
    ])
  }

  func galleryGestureDelegate(
    didSelectContextMenuOption indexPath: IndexPath,
    action: GalleryContextAction
  ) {
    guard let galleryItem = galleryView?.item(at: indexPath) else { return }
    didSelectContextMenuOption([
      "id": galleryItem.uri,
      "indexPath": [
        "section": indexPath.section,
        "item": indexPath.item,
      ],
      "action": action.id,
    ])
  }
}
