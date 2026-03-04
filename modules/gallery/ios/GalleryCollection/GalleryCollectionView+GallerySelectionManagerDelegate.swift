import SwiftUI
import UIKit

extension GalleryCollectionView: GallerySelectionManagerDelegate {

  func gallerySelectionManager(
    _ manager: GallerySelectionManager, didSelectItem indexPath: IndexPath
  ) {
    updateCellSelection(at: indexPath, isSelected: true)
    updateSectionHeader(for: indexPath.section)
    selectionEventDelegate?.gallerySelectionManager(manager, didSelectItem: indexPath)
  }

  func gallerySelectionManager(
    _ manager: GallerySelectionManager, didDeselectItem indexPath: IndexPath
  ) {
    updateCellSelection(at: indexPath, isSelected: false)
    updateSectionHeader(for: indexPath.section)
    selectionEventDelegate?.gallerySelectionManager(manager, didDeselectItem: indexPath)
  }

  func gallerySelectionManager(
    _ manager: GallerySelectionManager, didChangeSelection selection: Set<IndexPath>
  ) {
    reloadVisibleCells()
    updateVisibleSectionHeaders()
    selectionEventDelegate?.gallerySelectionManager(manager, didChangeSelection: selection)
  }

  func gallerySelectionManager(_ manager: GallerySelectionManager, didClearSelection: Void) {
    reloadVisibleCells()
    updateVisibleSectionHeaders()
    selectionEventDelegate?.gallerySelectionManager(manager, didClearSelection: ())
  }

  // MARK: - Helper methods

  private func updateCellSelection(at indexPath: IndexPath, isSelected: Bool) {
    guard let cell = cellForItem(at: indexPath) as? GalleryCollectionCell,
      let galleryConfig = self.galleryConfig
    else { return }

    // Reconfigure the cell with new selection state
    guard let item = self.item(at: indexPath) else { return }

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
          self?.selectionManager?.toggleSelection(at: indexPath)
        } else {
          self?.gestureDelegate?.galleryGestureDelegate(didTap: indexPath)
        }
      })

    generator.selectionChanged()
  }

  func reloadVisibleCells() {
    indexPathsForVisibleItems.forEach { indexPath in
      let isSelected = selectionManager?.isSelected(indexPath) ?? false
      updateCellSelection(at: indexPath, isSelected: isSelected)
    }
  }

  private func updateSectionHeader(for section: Int) {
    let headerIndexPath = IndexPath(item: 0, section: section)
    guard
      let header = supplementaryView(
        forElementKind: UICollectionView.elementKindSectionHeader,
        at: headerIndexPath
      ) as? GallerySectionHeader,
      let sectionModel = self.section(at: section)
    else { return }

    let isPartiallySelected = selectionManager?.isSectionPartiallySelected(section) ?? false

    // Rebuild the SwiftUI content for the existing header instance without mutating the collection view
    header.contentBuilder = { [weak self] existingContext in
      guard let self else { return AnyView(EmptyView()) }
      let label: SelectionButton.SelectionButtonLabel =
        isPartiallySelected ? .deselectAll : .selectAll
      let config = self.galleryConfig ?? GalleryConfig()
      let ctx = GallerySectionHeaderContext(
        section: existingContext.section,
        itemCount: existingContext.itemCount,
        selectionLabel: label,
        config: config,
        onToggleSelection: {
          if isPartiallySelected {
            self.deselectSection(at: section)
          } else {
            self.selectSection(at: section)
          }
        },
        onSelectAll: { self.selectSection(at: section) },
        onDeselectAll: { self.deselectSection(at: section) }
      )
      return AnyView(config.headerConfiguration.view.init(context: ctx))
    }

    // Reconfigure the existing header to apply the updated builder
    header.configure(with: sectionModel)
  }

  private func updateVisibleSectionHeaders() {
    // Get unique sections from visible items and update their headers in place
    let visibleSections = Set(indexPathsForVisibleItems.map { $0.section })
    for section in visibleSections {
      updateSectionHeader(for: section)
    }
  }
}
