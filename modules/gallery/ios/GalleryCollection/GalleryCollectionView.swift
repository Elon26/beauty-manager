import SwiftUI
import UIKit

final class GalleryCollectionView: UICollectionView {
  let generator = UISelectionFeedbackGenerator()

  // MARK: - Diffable Data Source
  private var diffableDataSource: UICollectionViewDiffableDataSource<GallerySection, GalleryItem>!

  var dataManager: GalleryDataManager? {
    didSet {
      dataManager?.delegate = self
      if dataManager != nil {
        applySnapshot(animatingDifferences: false)
      }
    }
  }

  var selectionManager: GallerySelectionManager? {
    didSet {
      selectionManager?.delegate = self
    }
  }

  var selectionEventDelegate: GallerySelectionManagerDelegate?
  var gestureDelegate: GalleryGestureDelegate?
  var galleryConfig: GalleryConfig?

  // SwiftUI builders for supplementary views
  var headerContentBuilder: ((GallerySectionHeaderContext) -> AnyView)?
  var footerContentBuilder: ((GallerySectionFooterContext) -> AnyView)?
  var backgroundContentBuilder: ((GallerySectionBackgroundContext) -> AnyView)?

  override init(frame: CGRect, collectionViewLayout layout: UICollectionViewLayout) {
    super.init(frame: frame, collectionViewLayout: layout)
    backgroundColor = .clear
    isOpaque = false
    registerViews()
    setupDiffableDataSource()
    delegate = self
  }

  init(with config: GalleryConfig) {
    super.init(frame: .zero, collectionViewLayout: config.collectionLayout)
    backgroundColor = .clear
    isOpaque = false
    applyConfiguration(config)
    registerViews()
    setupDiffableDataSource()
    delegate = self
  }

  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }

  // MARK: - Diffable Data Source Setup
  private func setupDiffableDataSource() {
    diffableDataSource = UICollectionViewDiffableDataSource<GallerySection, GalleryItem>(
      collectionView: self
    ) { [weak self] collectionView, indexPath, item in
      guard let self else {
        let fallbackCell = UICollectionViewCell()
        return fallbackCell
      }

      guard let galleryConfig = self.galleryConfig else {
        let fallbackCell = collectionView.dequeueReusableCell(
          withReuseIdentifier: GalleryCollectionCell.reuseIdentifier,
          for: indexPath
        )
        return fallbackCell
      }

      guard
        let cell = collectionView.dequeueReusableCell(
          withReuseIdentifier: GalleryCollectionCell.reuseIdentifier,
          for: indexPath
        ) as? GalleryCollectionCell
      else {
        assertionFailure("Failed to dequeue GalleryCollectionCell")
        return collectionView.dequeueReusableCell(
          withReuseIdentifier: GalleryCollectionCell.reuseIdentifier,
          for: indexPath
        )
      }

      let isSelected = self.selectionManager?.isSelected(indexPath) ?? false

      cell.contentBuilder = { context in
        AnyView(galleryConfig.cellConfiguration.view.init(context: context))
      }

      cell.configure(
        with: item.uri,
        itemId: UUID(),
        itemIndex: item.itemIndex,
        sectionIndex: indexPath.section,
        isSelected: isSelected,
        config: galleryConfig,
        onTap: { [weak self] in
          if galleryConfig.toggleSelectionOnTap {
            // Toggle selection
            self?.selectionManager?.toggleSelection(at: indexPath)
          } else {
            // Emit tap event
            if let cell = collectionView.cellForItem(at: indexPath),
              let currentIndexPath = self?.indexPath(for: cell)
            {
              self?.gestureDelegate?.galleryGestureDelegate(didTap: currentIndexPath)
            } else {
              self?.gestureDelegate?.galleryGestureDelegate(didTap: indexPath)
            }
          }
        })

      return cell
    }

    // Supplementary view provider
    diffableDataSource.supplementaryViewProvider = { [weak self] collectionView, kind, indexPath in
      if kind == UICollectionView.elementKindSectionHeader {
        guard
          let header = collectionView.dequeueReusableSupplementaryView(
            ofKind: kind,
            withReuseIdentifier: GallerySectionHeader.reuseIdentifier,
            for: indexPath
          ) as? GallerySectionHeader
        else {
          assertionFailure(
            "Failed to dequeue header with identifier \(GallerySectionHeader.reuseIdentifier)")
          return UICollectionReusableView()
        }

        // Get the section from the snapshot
        let snapshot = self?.diffableDataSource.snapshot()
        if let sections = snapshot?.sectionIdentifiers,
          indexPath.section < sections.count
        {
          let section = sections[indexPath.section]
          let isPartiallySelected =
            self?.selectionManager?.isSectionPartiallySelected(indexPath.section) ?? false

          // Build SwiftUI header content with computed selection state and actions
          header.contentBuilder = { [weak self] existingContext in
            guard let self else { return AnyView(EmptyView()) }
            let label: SelectionButton.SelectionButtonLabel =
              isPartiallySelected ? .deselectAll : .selectAll
            let config = self.galleryConfig ?? GalleryConfig()
            let newContext = GallerySectionHeaderContext(
              section: existingContext.section,
              itemCount: existingContext.itemCount,
              selectionLabel: label,
              config: config,
              onToggleSelection: {
                if isPartiallySelected {
                  self.deselectSection(at: indexPath.section)
                } else {
                  self.selectSection(at: indexPath.section)
                }
              },
              onSelectAll: { self.selectSection(at: indexPath.section) },
              onDeselectAll: { self.deselectSection(at: indexPath.section) }
            )
            return AnyView(config.headerConfiguration.view.init(context: newContext))
          }
          header.configure(with: section)
        }
        return header
      } else if kind == UICollectionView.elementKindSectionFooter {
        guard
          let footer = collectionView.dequeueReusableSupplementaryView(
            ofKind: kind,
            withReuseIdentifier: GallerySectionFooter.reuseIdentifier,
            for: indexPath
          ) as? GallerySectionFooter
        else {
          assertionFailure(
            "Failed to dequeue footer with identifier \(GallerySectionFooter.reuseIdentifier)")
          return UICollectionReusableView()
        }

        // Get the section from the snapshot
        let snapshot = self?.diffableDataSource.snapshot()
        if let sections = snapshot?.sectionIdentifiers,
          indexPath.section < sections.count
        {
          let section = sections[indexPath.section]
          // Inject SwiftUI builder and configure
          footer.contentBuilder = self?.footerContentBuilder
          if let config = self?.galleryConfig {
            footer.configure(with: section, config: config, onTap: nil)
          }
        }
        return footer
      }
      return UICollectionReusableView()
    }
  }

  // MARK: - Snapshot Management

  func applySnapshot(animatingDifferences: Bool = true, completion: (() -> Void)? = nil) {
    guard let dataManager = dataManager else {
      // Apply empty snapshot if no data manager
      let emptySnapshot = GallerySnapshot()
      diffableDataSource.apply(emptySnapshot, animatingDifferences: false)
      completion?()
      return
    }

    // Generate and apply new snapshot
    let snapshot = dataManager.generateSnapshot()

    if Thread.isMainThread {
      diffableDataSource.apply(snapshot, animatingDifferences: animatingDifferences) {
        completion?()
      }
    } else {
      DispatchQueue.main.async { [weak self] in
        self?.diffableDataSource.apply(snapshot, animatingDifferences: animatingDifferences) {
          completion?()
        }
      }
    }
  }

  func configure(_ config: GalleryConfig) {
    applyConfiguration(config)
    collectionViewLayout = config.collectionLayout
    if let compositionalLayout = collectionViewLayout as? UICollectionViewCompositionalLayout {
      compositionalLayout.register(
        GallerySectionBackgroundView.self,
        forDecorationViewOfKind: GallerySectionBackgroundView.elementKind
      )
    }
    applySnapshot(animatingDifferences: false)
  }

  private func applyConfiguration(_ config: GalleryConfig) {
    galleryConfig = config
    GallerySectionHeader.galleryConfig = config
    contentInset = config.contentInset

    // Inject SwiftUI builders from configuration
    headerContentBuilder = { ctx in AnyView(config.headerConfiguration.view.init(context: ctx)) }
    footerContentBuilder = { ctx in AnyView(config.footerConfiguration.view.init(context: ctx)) }
    backgroundContentBuilder = { ctx in
      AnyView(config.backgroundConfiguration.view.init(context: ctx))
    }
    // Wire background decoration providers
    GallerySectionBackgroundView.contentProvider = { [weak self] ctx in
      if let builder = self?.backgroundContentBuilder {
        return builder(ctx)
      } else {
        return AnyView(config.backgroundConfiguration.view.init(context: ctx))
      }
    }
    GallerySectionBackgroundView.sectionProvider = { [weak self] sectionIndex in
      guard let self else { return nil }
      let snapshot = self.diffableDataSource.snapshot()
      let sections = snapshot.sectionIdentifiers
      if sectionIndex >= 0 && sectionIndex < sections.count {
        return sections[sectionIndex]
      }
      return nil
    }
  }

  private func registerViews() {
    register(
      GalleryCollectionCell.self,
      forCellWithReuseIdentifier: GalleryCollectionCell.reuseIdentifier
    )
    register(
      GallerySectionHeader.self,
      forSupplementaryViewOfKind: UICollectionView.elementKindSectionHeader,
      withReuseIdentifier: GallerySectionHeader.reuseIdentifier
    )

    register(
      GallerySectionFooter.self,
      forSupplementaryViewOfKind: UICollectionView.elementKindSectionFooter,
      withReuseIdentifier: GallerySectionFooter.reuseIdentifier
    )
  }

  // MARK: - Helper Methods

  /// Get the GalleryItem for a given IndexPath
  func item(at indexPath: IndexPath) -> GalleryItem? {
    return diffableDataSource.itemIdentifier(for: indexPath)
  }

  func section(at sectionIndex: Int) -> GallerySection? {
    return diffableDataSource.sectionIdentifier(for: sectionIndex)
  }

  /// Get the IndexPath for a given PHAsset identifier
  func indexPath(for assetIdentifier: GalleryItemUri) -> IndexPath? {
    let snapshot = diffableDataSource.snapshot()

    for section in snapshot.sectionIdentifiers {
      let items = snapshot.itemIdentifiers(inSection: section)
      if let item = items.first(where: { $0.uri == assetIdentifier }) {
        return diffableDataSource.indexPath(for: item)
      }
    }
    return nil
  }

  /// Check if an asset is currently displayed
  func contains(assetIdentifier: GalleryItemUri) -> Bool {
    return indexPath(for: assetIdentifier) != nil
  }

}
