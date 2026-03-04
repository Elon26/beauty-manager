import UIKit

extension GalleryCollectionView {

  // MARK: - Public Selection API

  /// Selects all visible items
  func selectAllItems() {
    guard let dataManager = dataManager else { return }

    var allIndexPaths: [IndexPath] = []
    for section in 0..<dataManager.sectionCount {
      for item in 0..<dataManager.itemCount(in: section) {
        allIndexPaths.append(IndexPath(item: item, section: section))
      }
    }

    selectionManager?.selectAll(allIndexPaths)
  }

  /// Clears all selected items
  func clearSelection() {
    selectionManager?.clearSelection()
  }

  /// Gets the URIs of all selected items
  func getSelectedItemURIs() -> [GalleryItemUri] {
    guard let dataManager = dataManager,
      let selectionManager = selectionManager
    else { return [] }

    return selectionManager.getSelectedItems(from: dataManager)
  }

  /// Gets the count of selected items
  var selectedItemCount: Int {
    return selectionManager?.selectedCount ?? 0
  }

  /// Checks if any items are selected
  var hasSelection: Bool {
    return selectedItemCount > 0
  }

  /// Selects item at specific index path
  func selectItem(at indexPath: IndexPath) {
    selectionManager?.selectItem(at: indexPath)
  }

  /// Deselects item at specific index path
  func deselectItem(at indexPath: IndexPath) {
    selectionManager?.deselectItem(at: indexPath)
  }

  /// Toggles selection for item at specific index path
  func toggleItemSelection(at indexPath: IndexPath) {
    selectionManager?.toggleSelection(at: indexPath)
  }

  /// Checks if item at index path is selected
  func isItemSelected(at indexPath: IndexPath) -> Bool {
    return selectionManager?.isSelected(indexPath) ?? false
  }

  func selectSection(at section: Int) {
    guard let dataManager = dataManager else { return }

    var indexPaths: [IndexPath] = []
    for item in 0..<dataManager.itemCount(in: section) {
      indexPaths.append(IndexPath(item: item, section: section))
    }

    selectionManager?.selectItems(at: indexPaths)
  }

  /// Deselects all items in a section
  func deselectSection(at section: Int) {
    guard let selectionManager = selectionManager else { return }

    let selectedInSection = selectionManager.selectedItems.filter { $0.section == section }

    if !selectedInSection.isEmpty {
      selectionManager.deselectItems(at: Array(selectedInSection))
    }
  }
}
