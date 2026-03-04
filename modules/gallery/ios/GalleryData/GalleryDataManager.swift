import Foundation

// MARK: - Type Definitions
typealias GalleryItemUri = String
typealias GalleryData = [GallerySection]

struct GallerySection: Hashable {
  let id: UUID
  let assets: [GalleryItemUri]

  static func == (lhs: GallerySection, rhs: GallerySection) -> Bool {
    return lhs.id == rhs.id
  }

  func hash(into hasher: inout Hasher) {
    hasher.combine(id)
  }
}

struct GalleryItem: Hashable {
  let uri: GalleryItemUri  // PHAsset identifier
  let itemIndex: Int  // For display purposes (badges, etc.)

  static func == (lhs: GalleryItem, rhs: GalleryItem) -> Bool {
    return lhs.uri == rhs.uri
  }

  func hash(into hasher: inout Hasher) {
    hasher.combine(uri)
  }
}

typealias GallerySnapshot = NSDiffableDataSourceSnapshot<GallerySection, GalleryItem>

// MARK: - GalleryDataManager
final class GalleryDataManager {

  // MARK: - Properties
  private var _data: GalleryData = []
  private let queue = DispatchQueue(label: "com.expo.gallery.datamanager", attributes: .concurrent)

  weak var delegate: GalleryDataManagerDelegate?

  // MARK: - Thread-safe Data Access

  var data: GalleryData {
    return queue.sync { _data }
  }

  var sectionCount: Int {
    return queue.sync { _data.count }
  }

  var isEmpty: Bool {
    return queue.sync { _data.isEmpty }
  }

  func itemCount(in section: Int) -> Int {
    return queue.sync {
      guard section >= 0 && section < _data.count else { return 0 }
      return _data[section].assets.count
    }
  }

  func item(at section: Int, index: Int) -> GalleryItemUri? {
    return queue.sync {
      guard section >= 0 && section < _data.count,
        index >= 0 && index < _data[section].assets.count
      else {
        return nil
      }
      return _data[section].assets[index]
    }
  }

  func section(at index: Int) -> GallerySection? {
    return queue.sync {
      guard index >= 0 && index < _data.count else { return nil }
      return _data[index]
    }
  }

  func findItem(withUri uri: GalleryItemUri) -> (section: Int, index: Int)? {
    return queue.sync {
      for (sectionIndex, section) in _data.enumerated() {
        if let itemIndex = section.assets.firstIndex(of: uri) {
          return (sectionIndex, itemIndex)
        }
      }
      return nil
    }
  }

  // MARK: - Data Modification

  func setData(_ newData: GalleryData) {
    let updatedData = updateData {
      self._data = newData
      return newData
    }
    notifyDelegate { [weak self] in
      guard let self else { return }
      self.delegate?.galleryDataManager(self, didUpdateData: updatedData)
    }
  }

  func clearData() {
    let clearedData = updateData {
      let data = self._data
      self._data.removeAll()
      return data
    }
    notifyDelegate { [weak self] in
      guard let self else { return }
      self.delegate?.galleryDataManager(self, didClearData: clearedData)
    }
  }

  func updateSection(at index: Int, with newAssets: [GalleryItemUri]) {
    let result = updateData { () -> (success: Bool, data: GalleryData) in
      guard index >= 0 && index < self._data.count else {
        return (false, self._data)
      }
      let section = self._data[index]
      self._data[index] = GallerySection(id: section.id, assets: newAssets)
      return (true, self._data)
    }

    if result.success {
      notifyDelegate { [weak self] in
        guard let self else { return }
        self.delegate?.galleryDataManager(self, didUpdateData: result.data)
      }
    }
  }

  // MARK: - Snapshot Generation

  func generateSnapshot() -> GallerySnapshot {
    return queue.sync {
      var snapshot = GallerySnapshot()

      for section in _data {
        snapshot.appendSections([section])

        let items = section.assets.enumerated().map { index, uri in
          GalleryItem(uri: uri, itemIndex: index)
        }
        snapshot.appendItems(items, toSection: section)
      }

      return snapshot
    }
  }

  // MARK: - Private Helpers

  private func updateData<T>(_ update: @escaping () -> T) -> T {
    if Thread.isMainThread {
      return queue.sync(flags: .barrier) { update() }
    } else {
      return queue.sync(flags: .barrier) { update() }
    }
  }

  private func notifyDelegate(_ notification: @escaping () -> Void) {
    if Thread.isMainThread {
      notification()
    } else {
      DispatchQueue.main.async { notification() }
    }
  }
}

// MARK: - GalleryDataManagerDelegate Protocol

protocol GalleryDataManagerDelegate: AnyObject {
  func galleryDataManager(_ manager: GalleryDataManager, didUpdateData data: GalleryData)
  func galleryDataManager(_ manager: GalleryDataManager, didClearData data: GalleryData)
}
