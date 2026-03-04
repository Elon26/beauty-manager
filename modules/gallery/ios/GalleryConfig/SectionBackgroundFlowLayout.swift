import UIKit

/// A custom flow layout that provides a section background decoration view for each section,
/// enabling SwiftUI-driven backgrounds (via GallerySectionBackgroundView) to be visible in flow layouts.
///
/// How it works:
/// - Registers `GallerySectionBackgroundView` as a decoration view kind.
/// - During `prepare()`, computes a decoration attributes frame per section by unioning
///   the section's header, items, and footer frames.
/// - Injects those decoration attributes into `layoutAttributesForElements(in:)`.
///
/// Notes:
/// - The layout expects header/footer reference sizes to be set (non-zero) if you want
///   the background to include them.
/// - Background is positioned from `contentInset.left` to `collectionView.bounds.width - contentInset.right`.
/// - Vertical extents are computed as a union of header/items/footer; if a section is empty and has
///   neither header nor footer, a background is not created for that section.
final class SectionBackgroundFlowLayout: UICollectionViewFlowLayout {

  private var decorationAttributesCache: [IndexPath: UICollectionViewLayoutAttributes] = [:]

  override init() {
    super.init()
    registerDecoration()
  }

  required init?(coder: NSCoder) {
    super.init(coder: coder)
    registerDecoration()
  }

  private func registerDecoration() {
    // Register background decoration view kind for flow layout
    self.register(
      GallerySectionBackgroundView.self,
      forDecorationViewOfKind: GallerySectionBackgroundView.elementKind
    )
  }

  override func prepare() {
    super.prepare()
    buildDecorationAttributes()
  }

  override func layoutAttributesForElements(in rect: CGRect) -> [UICollectionViewLayoutAttributes]?
  {
    // Base attributes from super
    var attributes = super.layoutAttributesForElements(in: rect) ?? []

    // Append decoration attributes that intersect the requested rect
    for attr in decorationAttributesCache.values where attr.frame.intersects(rect) {
      attributes.append(attr)
    }
    return attributes
  }

  override func layoutAttributesForDecorationView(
    ofKind elementKind: String,
    at indexPath: IndexPath
  ) -> UICollectionViewLayoutAttributes? {
    guard elementKind == GallerySectionBackgroundView.elementKind else {
      return super.layoutAttributesForDecorationView(ofKind: elementKind, at: indexPath)
    }
    return decorationAttributesCache[indexPath]
  }

  override func shouldInvalidateLayout(forBoundsChange newBounds: CGRect) -> Bool {
    // Invalidate on bounds change to recompute background frames during rotations/size changes
    return true
  }

  // MARK: - Private

  private func buildDecorationAttributes() {
    decorationAttributesCache.removeAll()

    guard let collectionView = collectionView else { return }

    let sectionsCount = collectionView.numberOfSections
    guard sectionsCount > 0 else { return }

    // Convenience
    let contentInset = collectionView.contentInset
    let cvBounds = collectionView.bounds
    let backgroundOriginX: CGFloat = 0
    let backgroundWidth = max(0, cvBounds.width - contentInset.left - contentInset.right)

    for section in 0..<sectionsCount {
      let indexPath0 = IndexPath(item: 0, section: section)

      // Header/footer attributes (if present)
      let headerAttr = super.layoutAttributesForSupplementaryView(
        ofKind: UICollectionView.elementKindSectionHeader, at: indexPath0)
      let footerAttr = super.layoutAttributesForSupplementaryView(
        ofKind: UICollectionView.elementKindSectionFooter, at: indexPath0)

      // Item attributes (first and last to estimate vertical span)
      let itemsCount = collectionView.numberOfItems(inSection: section)
      var minY: CGFloat = .greatestFiniteMagnitude
      var maxY: CGFloat = -.greatestFiniteMagnitude

      if let headerAttr {
        minY = min(minY, headerAttr.frame.minY)
        maxY = max(maxY, headerAttr.frame.maxY)
      }

      if itemsCount > 0 {
        if let firstItem = super.layoutAttributesForItem(at: indexPath0) {
          minY = min(minY, firstItem.frame.minY)
          maxY = max(maxY, firstItem.frame.maxY)
        }

        // The last item is expected to be at/below the bottom-most row in vertical flow
        let lastIndexPath = IndexPath(item: itemsCount - 1, section: section)
        if let lastItem = super.layoutAttributesForItem(at: lastIndexPath) {
          minY = min(minY, lastItem.frame.minY)
          maxY = max(maxY, lastItem.frame.maxY)
        }

        // For robustness: try unioning all item attrs if needed (only if initial estimation failed)
        if minY == .greatestFiniteMagnitude || maxY == -.greatestFiniteMagnitude {
          var itemsUnion: CGRect?
          // Using a tall rect to query items for this section
          let veryTallRect = CGRect(
            x: 0, y: 0, width: cvBounds.width, height: max(cvBounds.height, 10000))
          if let allAttrs = super.layoutAttributesForElements(in: veryTallRect) {
            for a in allAttrs
            where a.representedElementCategory == .cell && a.indexPath.section == section {
              itemsUnion = (itemsUnion == nil) ? a.frame : itemsUnion!.union(a.frame)
            }
          }
          if let itemsUnion {
            minY = min(minY, itemsUnion.minY)
            maxY = max(maxY, itemsUnion.maxY)
          }
        }
      }

      if let footerAttr {
        minY = min(minY, footerAttr.frame.minY)
        maxY = max(maxY, footerAttr.frame.maxY)
      }

      // If we didn't find any geometry for this section (no header/items/footer), skip
      guard minY != .greatestFiniteMagnitude && maxY != -.greatestFiniteMagnitude else {
        continue
      }

      let backgroundFrame = CGRect(
        x: backgroundOriginX,
        y: minY,
        width: backgroundWidth,
        height: max(1, maxY - minY)
      )

      let decorationIndexPath = IndexPath(item: 0, section: section)
      let attr = UICollectionViewLayoutAttributes(
        forDecorationViewOfKind: GallerySectionBackgroundView.elementKind,
        with: decorationIndexPath
      )
      attr.frame = backgroundFrame
      // Ensure background sits behind cells and supplementary views
      attr.zIndex = -1

      decorationAttributesCache[decorationIndexPath] = attr
    }
  }
}
