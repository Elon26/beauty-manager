protocol GalleryGestureDelegate: AnyObject {
  func galleryGestureDelegate(didTap indexPath: IndexPath)
  func galleryGestureDelegate(
    didSelectContextMenuOption indexPath: IndexPath, action: GalleryContextAction)
}
