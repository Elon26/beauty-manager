import ExpoModulesCore
import Photos
import SwiftUI

class GalleryView: ExpoView {
  var galleryView: GalleryCollectionView?
  var dataManager: GalleryDataManager?
  var selectionManager: GallerySelectionManager?

  private var permissionRequested = false

  let didSelectItem = EventDispatcher()
  let didDeselectItem = EventDispatcher()
  let didChangeSelection = EventDispatcher()
  let didClearSelection = EventDispatcher()
  let didTapItem = EventDispatcher()
  let didSelectContextMenuOption = EventDispatcher()
  let didInitialize = EventDispatcher()

  required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    setupView()
  }

  func configure(_ config: GalleryConfig) {
    galleryView?.configure(config)
    if let galleryView {
      galleryView.headerContentBuilder = { ctx in
        AnyView(config.headerConfiguration.view.init(context: ctx))
      }
      galleryView.footerContentBuilder = { ctx in
        AnyView(config.footerConfiguration.view.init(context: ctx))
      }
      galleryView.backgroundContentBuilder = { ctx in
        AnyView(config.backgroundConfiguration.view.init(context: ctx))
      }
      if let compositionalLayout = galleryView.collectionViewLayout
        as? UICollectionViewCompositionalLayout
      {
        compositionalLayout.register(
          GallerySectionBackgroundView.self,
          forDecorationViewOfKind: GallerySectionBackgroundView.elementKind
        )
      }
    }
  }

  private func setupView() {
    clipsToBounds = true

    let config = GalleryConfig()
    galleryView = GalleryCollectionView(with: config)
    guard let galleryView else {
      assertionFailure("galleryView is nil")
      return
    }
    // Wire SwiftUI section builders
    galleryView.headerContentBuilder = { ctx in
      AnyView(config.headerConfiguration.view.init(context: ctx))
    }
    galleryView.footerContentBuilder = { ctx in
      AnyView(config.footerConfiguration.view.init(context: ctx))
    }
    galleryView.backgroundContentBuilder = { ctx in
      AnyView(config.backgroundConfiguration.view.init(context: ctx))
    }
    // Register background decoration for initial layout if compositional
    if let compositionalLayout = galleryView.collectionViewLayout
      as? UICollectionViewCompositionalLayout
    {
      compositionalLayout.register(
        GallerySectionBackgroundView.self,
        forDecorationViewOfKind: GallerySectionBackgroundView.elementKind
      )
    }

    dataManager = GalleryDataManager()
    selectionManager = GallerySelectionManager()
    galleryView.dataManager = dataManager
    galleryView.selectionManager = selectionManager
    galleryView.selectionEventDelegate = self
    galleryView.gestureDelegate = self

    addSubview(galleryView)

    // Request photo permissions when view is created
    requestPhotoPermissionsIfNeeded()
    didInitialize()

  }

  override func layoutSubviews() {
    super.layoutSubviews()
    guard let galleryView = galleryView else { return }
    galleryView.frame = bounds
  }

  private func requestPhotoPermissionsIfNeeded() {
    guard !permissionRequested else { return }
    permissionRequested = true

    PhotoKitHelper.shared.requestPhotoLibraryPermission { _ in }
    //  { [weak self] granted in
    //   if granted {
    //     // print("Photo library access granted")
    //   } else {
    //     print("Photo library access denied")
    //   }
    // }
  }
}
