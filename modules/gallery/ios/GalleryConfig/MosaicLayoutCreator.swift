import UIKit

@available(iOS 13.0, *)
struct MosaicLayoutCreator: GalleryLayoutCreator {
  func createLayout(config: GalleryConfig) -> UICollectionViewLayout {
    let layoutConfig = UICollectionViewCompositionalLayoutConfiguration()
    layoutConfig.scrollDirection = .vertical

    return UICollectionViewCompositionalLayout(
      sectionProvider: { sectionIndex, environment in
        self.createMosaicSection(for: sectionIndex, environment: environment, config: config)
      },
      configuration: layoutConfig
    )
  }

  private func createMosaicSection(
    for sectionIndex: Int,
    environment: NSCollectionLayoutEnvironment,
    config: GalleryConfig
  ) -> NSCollectionLayoutSection {

    let size = config.itemSize
    let itemWidth = size.width
    let itemHeight = size.height

    let smallItemWidth = itemWidth / 2 - config.gap / 2
    let smallItemHeight = smallItemWidth / config.itemAspectRatio

    let maxRows = Int((itemHeight + config.gap) / (smallItemHeight + config.gap))

    let largeItemSize = NSCollectionLayoutSize(
      widthDimension: .absolute(itemWidth),
      heightDimension: .absolute(itemHeight)
    )
    let largeItem = NSCollectionLayoutItem(layoutSize: largeItemSize)

    let smallItemSize = NSCollectionLayoutSize(
      widthDimension: .absolute(smallItemWidth),
      heightDimension: .absolute(smallItemHeight)
    )

    let smallColumnSize = NSCollectionLayoutSize(
      widthDimension: .absolute(smallItemWidth),
      heightDimension: .absolute(itemHeight)
    )

    // Create multiple columns of small items to ensure horizontal scrolling
    var smallColumns: [NSCollectionLayoutGroup] = []
    for _ in 0..<20 {  // Create enough columns to ensure scrolling
      var columnItems: [NSCollectionLayoutItem] = []
      for _ in 0..<maxRows {
        columnItems.append(NSCollectionLayoutItem(layoutSize: smallItemSize))
      }

      let column = NSCollectionLayoutGroup.vertical(
        layoutSize: smallColumnSize,
        subitems: columnItems
      )
      column.interItemSpacing = .fixed(config.gap)
      smallColumns.append(column)
    }

    // Horizontal group for small items area
    let smallItemsAreaWidth = CGFloat(20) * (smallItemWidth + config.gap) - config.gap
    let smallItemsGroupSize = NSCollectionLayoutSize(
      widthDimension: .absolute(smallItemsAreaWidth),
      heightDimension: .absolute(itemHeight)
    )
    let smallItemsGroup = NSCollectionLayoutGroup.horizontal(
      layoutSize: smallItemsGroupSize,
      subitems: smallColumns
    )
    smallItemsGroup.interItemSpacing = .fixed(config.gap)

    // Main horizontal group containing large item and small items
    let mainGroupSize = NSCollectionLayoutSize(
      widthDimension: .absolute(itemWidth + config.gap + smallItemsAreaWidth),
      heightDimension: .absolute(itemHeight)
    )
    let mainGroup = NSCollectionLayoutGroup.horizontal(
      layoutSize: mainGroupSize,
      subitems: [largeItem, smallItemsGroup]
    )
    mainGroup.interItemSpacing = .fixed(config.gap)

    // Section
    let section = NSCollectionLayoutSection(group: mainGroup)
    section.orthogonalScrollingBehavior = .continuous
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

    // Section background decoration
    let background = NSCollectionLayoutDecorationItem.background(
      elementKind: GallerySectionBackgroundView.elementKind
    )
    // Keep background aligned with the section content area
    background.contentInsets = .zero
    section.decorationItems = [background]

    return section
  }
}
