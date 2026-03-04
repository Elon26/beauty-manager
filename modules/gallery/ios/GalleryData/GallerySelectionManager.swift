import Foundation

final class GallerySelectionManager {
  private var _selectedItems: Set<IndexPath> = []
  private let queue = DispatchQueue(
    label: "com.expo.gallery.selectionmanager", attributes: .concurrent)

  weak var delegate: GallerySelectionManagerDelegate?

  // MARK: - Thread-safe selection access

  var selectedItems: Set<IndexPath> {
    return queue.sync {
      return _selectedItems
    }
  }

  var selectedCount: Int {
    return queue.sync {
      return _selectedItems.count
    }
  }

  func isSelected(_ indexPath: IndexPath) -> Bool {
    return queue.sync {
      return _selectedItems.contains(indexPath)
    }
  }

  func isSectionPartiallySelected(_ section: Int) -> Bool {
    return queue.sync {
      return _selectedItems.contains(where: { $0.section == section })
    }
  }

  // MARK: - Thread-safe selection modification

  func selectItem(at indexPath: IndexPath) {
    queue.async(flags: .barrier) {
      let wasSelected = self._selectedItems.contains(indexPath)
      if !wasSelected {
        self._selectedItems.insert(indexPath)

        DispatchQueue.main.async {
          self.delegate?.gallerySelectionManager(self, didSelectItem: indexPath)
        }
      }
    }
  }

  func selectItems(at indexPaths: [IndexPath]) {
    queue.async(flags: .barrier) {
      for indexPath in indexPaths {
        let wasSelected = self._selectedItems.contains(indexPath)
        if !wasSelected {
          self._selectedItems.insert(indexPath)

        }
      }
      DispatchQueue.main.async {
        self.delegate?.gallerySelectionManager(self, didChangeSelection: self._selectedItems)
      }
    }
  }

  func deselectItem(at indexPath: IndexPath) {
    queue.async(flags: .barrier) {
      let wasSelected = self._selectedItems.contains(indexPath)
      if wasSelected {
        self._selectedItems.remove(indexPath)

        DispatchQueue.main.async {
          self.delegate?.gallerySelectionManager(self, didDeselectItem: indexPath)
        }
      }
    }
  }

  func deselectItems(at indexPaths: [IndexPath]) {
    queue.async(flags: .barrier) {
      for indexPath in indexPaths {
        let wasSelected = self._selectedItems.contains(indexPath)
        if wasSelected {
          self._selectedItems.remove(indexPath)

        }
      }
      DispatchQueue.main.async {
        self.delegate?.gallerySelectionManager(self, didChangeSelection: self._selectedItems)
      }
    }
  }

  private func setSelection(at section: Int, to newValue: Bool) {
    queue.async(flags: .barrier) {
      let sectionIndexPaths = self._selectedItems.filter { $0.section == section }
      for indexPath in sectionIndexPaths {
        if newValue {
          self._selectedItems.insert(indexPath)
        } else {
          self._selectedItems.remove(indexPath)
        }
      }
      DispatchQueue.main.async {
        self.delegate?.gallerySelectionManager(self, didChangeSelection: self._selectedItems)
      }
    }
  }

  func deselectSection(at section: Int) {
    setSelection(at: section, to: false)
  }

  func selectSection(at section: Int) {
    setSelection(at: section, to: true)
  }

  func toggleSelection(at indexPath: IndexPath) {
    queue.async(flags: .barrier) {
      let wasSelected = self._selectedItems.contains(indexPath)
      if wasSelected {
        self._selectedItems.remove(indexPath)
        DispatchQueue.main.async {
          self.delegate?.gallerySelectionManager(self, didDeselectItem: indexPath)
        }
      } else {
        self._selectedItems.insert(indexPath)
        DispatchQueue.main.async {
          self.delegate?.gallerySelectionManager(self, didSelectItem: indexPath)
        }
      }
    }
  }

  func setSelection(_ indexPaths: [IndexPath]) {
    queue.async(flags: .barrier) {
      self._selectedItems = Set(indexPaths)
      DispatchQueue.main.async {
        self.delegate?.gallerySelectionManager(self, didChangeSelection: self._selectedItems)
      }
    }
  }

  func selectAll(_ indexPaths: [IndexPath]) {
    queue.async(flags: .barrier) {
      let previousCount = self._selectedItems.count
      self._selectedItems.formUnion(indexPaths)

      if self._selectedItems.count != previousCount {
        DispatchQueue.main.async {
          self.delegate?.gallerySelectionManager(self, didChangeSelection: self._selectedItems)
        }
      }
    }
  }

  func clearSelection() {
    queue.async(flags: .barrier) {
      let hadSelection = !self._selectedItems.isEmpty
      self._selectedItems.removeAll()

      if hadSelection {
        DispatchQueue.main.async {
          self.delegate?.gallerySelectionManager(self, didClearSelection: ())
        }
      }
    }
  }

  func getSelectedItems(from dataManager: GalleryDataManager) -> [GalleryItemUri] {
    return queue.sync {
      return _selectedItems.compactMap { indexPath in
        dataManager.item(at: indexPath.section, index: indexPath.item)
      }
    }
  }

  func reportSelection() {
    self.delegate?.gallerySelectionManager(self, didChangeSelection: self._selectedItems)
  }

}

// MARK: - GallerySelectionManagerDelegate Protocol

protocol GallerySelectionManagerDelegate: AnyObject {
  func gallerySelectionManager(
    _ manager: GallerySelectionManager, didSelectItem indexPath: IndexPath)
  func gallerySelectionManager(
    _ manager: GallerySelectionManager, didDeselectItem indexPath: IndexPath)
  func gallerySelectionManager(
    _ manager: GallerySelectionManager, didChangeSelection selection: Set<IndexPath>)
  func gallerySelectionManager(_ manager: GallerySelectionManager, didClearSelection: Void)
}
