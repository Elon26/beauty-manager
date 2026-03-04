import UIKit

@available(iOS 13.0, *)
struct HorizontalLayoutCreator: GalleryLayoutCreator {
  func createLayout(config: GalleryConfig) -> UICollectionViewLayout {
    let layoutConfig = UICollectionViewCompositionalLayoutConfiguration()
    layoutConfig.scrollDirection = .vertical

    return UICollectionViewCompositionalLayout(
      sectionProvider: { sectionIndex, environment in
        self.createHorizontalSection(for: sectionIndex, environment: environment, config: config)
      },
      configuration: layoutConfig
    )
  }

  private func createHorizontalSection(
    for sectionIndex: Int,
    environment: NSCollectionLayoutEnvironment,
    config: GalleryConfig
  ) -> NSCollectionLayoutSection {

    let size = config.itemSize
    let itemWidth = size.width
    let itemHeight = size.height

    let itemSize = NSCollectionLayoutSize(
      widthDimension: .absolute(itemWidth),
      heightDimension: .absolute(itemHeight)
    )
    let item = NSCollectionLayoutItem(layoutSize: itemSize)

    // Group (horizontal row of items)
    let groupSize = NSCollectionLayoutSize(
      widthDimension: .absolute(itemWidth),
      heightDimension: .absolute(itemHeight)
    )
    let group = NSCollectionLayoutGroup.horizontal(layoutSize: groupSize, subitems: [item])

    // Section
    let section = NSCollectionLayoutSection(group: group)
    section.orthogonalScrollingBehavior = .continuous
    section.interGroupSpacing = config.gap
    section.contentInsets = NSDirectionalEdgeInsets(
      top: config.sectionInset.top,
      leading: config.sectionInset.left,
      bottom: config.sectionInset.bottom,
      trailing: config.sectionInset.right
    )

    // Section header & footer
    let headerSize = NSCollectionLayoutSize(
      widthDimension: .fractionalWidth(1.0),
      heightDimension: .absolute(config.sectionHeaderHeight)
    )
    let header = NSCollectionLayoutBoundarySupplementaryItem(
      layoutSize: headerSize,
      elementKind: UICollectionView.elementKindSectionHeader,
      alignment: .top
    )

    let footerSize = NSCollectionLayoutSize(
      widthDimension: .fractionalWidth(1.0),
      heightDimension: .absolute(config.sectionFooterHeight)
    )
    let footer = NSCollectionLayoutBoundarySupplementaryItem(
      layoutSize: footerSize,
      elementKind: UICollectionView.elementKindSectionFooter,
      alignment: .bottom
    )

    section.boundarySupplementaryItems = [header, footer]

    // Background decoration
    let background = NSCollectionLayoutDecorationItem.background(
      elementKind: GallerySectionBackgroundView.elementKind
    )
    background.contentInsets = .zero
    section.decorationItems = [background]

    return section
  }
}
