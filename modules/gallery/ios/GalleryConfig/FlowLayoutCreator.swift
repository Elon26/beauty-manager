import UIKit

struct FlowLayoutCreator: GalleryLayoutCreator {
  func createLayout(config: GalleryConfig) -> UICollectionViewLayout {
    let layout = SectionBackgroundFlowLayout()

    layout.itemSize = config.itemSize
    layout.minimumLineSpacing = config.gap
    layout.minimumInteritemSpacing = config.gap
    layout.sectionInset = config.sectionInset
    layout.scrollDirection = .vertical

    // Provide header and footer reference sizes so supplementary SwiftUI views appear
    let totalHorizontalInsets =
      config.sectionInset.left + config.sectionInset.right
      + config.contentInset.left + config.contentInset.right
    let headerFooterWidth = max(0, UIScreen.main.bounds.width - totalHorizontalInsets)
    let headerHeight = config.sectionHeaderHeight
    let footerHeight = config.sectionFooterHeight
    layout.headerReferenceSize = CGSize(width: headerFooterWidth, height: headerHeight)
    layout.footerReferenceSize = CGSize(width: headerFooterWidth, height: footerHeight)

    return layout
  }
}
