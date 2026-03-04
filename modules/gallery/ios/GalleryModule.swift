import ExpoModulesCore

public class GalleryModule: Module {
  public func definition() -> ModuleDefinition {
    Name("Gallery")

    View(GalleryView.self) {
      Events(
        "didSelectItem", "didDeselectItem", "didChangeSelection", "didClearSelection",
        "didInitialize", "didTapItem", "didSelectContextMenuOption"
      )

      OnViewDidUpdateProps { view in
        view.didInitialize()
      }

      AsyncFunction("setSelection") { (view: GalleryView, selection: [[String: Any]]) in
        var indexPaths = [IndexPath]()
        for item in selection {
          if let index = item["item"] as? Int, let section = item["section"] as? Int {
            indexPaths.append(IndexPath(row: index, section: section))
          }
        }
        view.selectionManager?.setSelection(indexPaths)
      }

      AsyncFunction("selectItem") { (view: GalleryView, item: [String: Any]) in
        if let index = item["item"] as? Int, let section = item["section"] as? Int {
          view.selectionManager?.selectItem(at: IndexPath(row: index, section: section))
        }
      }

      AsyncFunction("deselectItem") { (view: GalleryView, item: [String: Any]) in
        if let index = item["item"] as? Int, let section = item["section"] as? Int {
          view.selectionManager?.deselectItem(at: IndexPath(row: index, section: section))
        }
      }

      AsyncFunction("selectAll") { (view: GalleryView) in
        view.galleryView?.selectAllItems()
      }

      AsyncFunction("clearSelection") { (view: GalleryView) in
        view.selectionManager?.clearSelection()
      }

      AsyncFunction("setData") { [weak self] (view: GalleryView, data: [[String: Any]]) in
        guard let self else { return }
        let newData = self.galleryData(from: data)
        view.dataManager?.setData(newData)
      }

      AsyncFunction("setConfig") { (view: GalleryView, config: [String: Any]) in
        let mutableConfig = MutableGalleryConfig(
          from: config, with: view.galleryView?.galleryConfig
        )
        let config = GalleryConfig(from: mutableConfig)

        DispatchQueue.main.async {
          view.configure(config)
          view.galleryView?.reloadVisibleCells()
        }
      }

      AsyncFunction("scrollTo") { (view: GalleryView, section: Int, index: Int) in
        print("Scrolling to section \(section) and index \(index)")
        guard view.dataManager?.item(at: section, index: index) != nil else { return }
        print("view.dataManager?.item(at: section, index: index) != nil")
        DispatchQueue.main.async {
          let indexPath = IndexPath(item: index, section: section)
          view.galleryView?.scrollToItem(
            at: indexPath,
            at: view.galleryView?.galleryConfig?.layoutType == .flow
              ? .centeredVertically : .centeredHorizontally,
            animated: true)
          if let cell = view.galleryView?.cellForItem(at: indexPath)
            as? GalleryCollectionCell
          {
            // cell.highlight()
          }
        }
      }

      Prop("data") { [weak self] (view: GalleryView, data: [[String: Any]]) in
        guard let self else { return }
        let newData = self.galleryData(from: data)
        view.dataManager?.setData(newData)
      }

      Prop("config") { (view: GalleryView, config: [String: Any]) in
        let mutableConfig = MutableGalleryConfig(from: config)
        let config = GalleryConfig(from: mutableConfig)

        view.configure(config)
      }

    }
  }

  private func galleryData(from data: [[String: Any]]) -> [GallerySection] {
    var newData: [GallerySection] = []

    for sectionData in data {
      if let assets = sectionData["assets"] as? [String] {
        var id: UUID
        if let uuidString = sectionData["id"] as? String,
          let uuid = UUID(uuidString: uuidString)
        {
          id = uuid
        } else {
          id = UUID()
        }
        let section = GallerySection(
          id: id,
          assets: assets
        )
        newData.append(section)
      }
    }

    return newData
  }
}
