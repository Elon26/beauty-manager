import UIKit

extension GalleryCollectionView: UICollectionViewDelegate {

  func collectionView(_ collectionView: UICollectionView, didSelectItemAt indexPath: IndexPath) {
    collectionView.deselectItem(at: indexPath, animated: false)

    if let cell = collectionView.cellForItem(at: indexPath),
      let currentIndexPath = self.indexPath(for: cell)
    {
      gestureDelegate?.galleryGestureDelegate(didTap: currentIndexPath)
    } else {
      gestureDelegate?.galleryGestureDelegate(didTap: indexPath)
    }
  }

  func collectionView(_ collectionView: UICollectionView, shouldSelectItemAt indexPath: IndexPath)
    -> Bool
  {
    return true
  }

  func collectionView(_ collectionView: UICollectionView, shouldDeselectItemAt indexPath: IndexPath)
    -> Bool
  {
    return true
  }

  func collectionView(
    _ collectionView: UICollectionView,
    contextMenuConfigurationForItemAt indexPath: IndexPath,
    point: CGPoint
  ) -> UIContextMenuConfiguration? {
    let identifier = indexPath as NSIndexPath
    return UIContextMenuConfiguration(
      identifier: identifier,
      previewProvider: { [weak self] in
        guard let self = self, let item = self.item(at: indexPath) else { return nil }
        let radius = self.galleryConfig?.itemCornerRadius ?? 0
        return GalleryPreviewViewController(uri: item.uri, cornerRadius: radius)
      },
      actionProvider: { [weak self] _ in
        guard let self = self else { return UIMenu(children: []) }
        let actions =
          galleryConfig?.actions.map({ action in
            UIAction(
              title: action.title, image: UIImage(systemName: action.symbol),
              attributes: action.attributes, state: action.state
            ) {
              [weak self] a in
              self?.gestureDelegate?.galleryGestureDelegate(
                didSelectContextMenuOption: indexPath, action: action)
            }
          }) ?? []
        return UIMenu(title: "", children: actions)
      }
    )
  }

  // Preview animation customization
  func collectionView(
    _ collectionView: UICollectionView,
    previewForHighlightingContextMenuWithConfiguration configuration: UIContextMenuConfiguration
  ) -> UITargetedPreview? {
    guard let indexPath = configuration.identifier as? IndexPath,
      let cell = collectionView.cellForItem(at: indexPath) as? GalleryCollectionCell
    else { return nil }

    let parameters = UIPreviewParameters()
    parameters.backgroundColor = .clear
    parameters.visiblePath = UIBezierPath(
      roundedRect: cell.contentView.bounds, cornerRadius: self.galleryConfig?.itemCornerRadius ?? 0)

    return UITargetedPreview(
      view: cell.contentView,
      parameters: parameters
    )
  }

  // Dismissal animation customization
  func collectionView(
    _ collectionView: UICollectionView,
    previewForDismissingContextMenuWithConfiguration configuration: UIContextMenuConfiguration
  ) -> UITargetedPreview? {
    guard let indexPath = configuration.identifier as? IndexPath,
      let cell = collectionView.cellForItem(at: indexPath) as? GalleryCollectionCell
    else { return nil }

    let parameters = UIPreviewParameters()
    parameters.backgroundColor = .clear
    parameters.visiblePath = UIBezierPath(
      roundedRect: cell.contentView.bounds, cornerRadius: self.galleryConfig?.itemCornerRadius ?? 0)

    return UITargetedPreview(
      view: cell.contentView,
      parameters: parameters
    )
  }

  // Optional: handle committing the preview (tap on the preview)
  func collectionView(
    _ collectionView: UICollectionView,
    willPerformPreviewActionForMenuWith configuration: UIContextMenuConfiguration,
    animator: UIContextMenuInteractionCommitAnimating
  ) {
    // If you want to present the preview VC full-screen on commit, you can do that here.
  }
}
