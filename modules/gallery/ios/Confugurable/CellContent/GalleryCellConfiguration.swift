import SwiftUI

enum GalleryCellConfiguration: String {
  case `default`
  case checkbox

  var view: any GalleryCellContent.Type {
    switch self {
    case .default:
      return DefaultGalleryCellContent.self
    case .checkbox:
      return GalleryCellContentCheckbox.self
    }
  }
}

extension GalleryCellConfiguration {
  var reuseIdentifier: String {
    "GalleryCollectionCell"
  }

  func registerCell(in collectionView: UICollectionView) {
    collectionView.register(
      GalleryCollectionCell.self,
      forCellWithReuseIdentifier: reuseIdentifier
    )
  }

  func configureCell(
    _ cell: GalleryCollectionCell,
    uri: String,
    itemId: UUID,
    itemIndex: Int,
    sectionIndex: Int,
    isSelected: Bool,
    config: GalleryConfig,
    onTap: @escaping () -> Void
  ) {
    cell.contentBuilder = { context in AnyView(self.view.init(context: context)) }
    cell.configure(
      with: uri, itemId: itemId, itemIndex: itemIndex, sectionIndex: sectionIndex,
      isSelected: isSelected, config: config, onTap: onTap)
  }
}
