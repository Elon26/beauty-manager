import ExpoModulesCore
import Photos

public class GalleryCleanerKitModule: Module {
  private let duplicateDetectorThumbnailSize = 32
  private let cacheFactory = CacheFactory.shared
  // private let blurryDetector = BlurryDetector()
  private var intermediateResultsSender: IntermediateDuplicateResultsSender?
  private var eventDelegate: JSEventsDelegate?
  private var duplicateDetector: DuplicateDetector?
  private var scoringCoordinator = ScoringCoordinator(maxConcurrent: 5)
  // @available(iOS 18.0, *)
  // private var aestheticsScorer: AestheticsScorer? {
  //   AestheticsScorer()
  // }

  private let fetchOptions: PHFetchOptions = {
    let options = PHFetchOptions()
    options.sortDescriptors = [NSSortDescriptor(key: "creationDate", ascending: false)]
    options.includeAssetSourceTypes = [.typeUserLibrary]
    return options
  }()

  public func definition() -> ModuleDefinition {
    Name("GalleryCleanerKit")
    Events(JSEventsDelegate.Events.allCases.map { $0.rawValue })

   OnCreate {
  eventDelegate = JSEventsDelegate(sendEvent: sendEvent)
  intermediateResultsSender = IntermediateDuplicateResultsSender {
    [weak eventDelegate] result in
    eventDelegate?.onIntermediateResult(result: result)
  }

  duplicateDetector = DuplicateDetector(
    threshold: 0.9, thumbnailSize: duplicateDetectorThumbnailSize, 
    hashCache: cacheFactory.hashCache)

  duplicateDetector?.onLookupStarted = { [weak eventDelegate] in
    eventDelegate?.onLookupStarted(process: .similarPhotos)
  }
  duplicateDetector?.onLookupFinished = { [weak eventDelegate] in
    eventDelegate?.onLookupFinished(process: .similarPhotos)
  }
  duplicateDetector?.onLookupProgressChange = { [weak eventDelegate] progress in
    eventDelegate?.onLookupProgressChange(processName: .similarPhotos, progress: progress)
  }
  duplicateDetector?.onDuplicatesFound = {
    [weak intermediateResultsSender, weak scoringCoordinator] result in
    Task {
      let filteredResult = result.filter { group in
        !group.contains { $0.mediaSubtypes.contains(.photoScreenshot) }
      }
      
      for group in filteredResult {
        await intermediateResultsSender?.addGroup(group)
      }

      guard let scoringCoordinator, let sender = intermediateResultsSender else {
        print("⚠️ Missing references for scoring")
        return
      }

      let allAssets = filteredResult.flatMap { $0 }
      await scoringCoordinator.queueAssets(
        allAssets,
        sender: sender,
        scorer: .auto
      )
    }
  }
}

    AsyncFunction("getAllAssets") { (promise: Promise) in
      try checkAuth()
      let assets = PHAsset.fetchAssets(with: .image, options: fetchOptions)
      promise.resolve(["ids": assets.ids()])
    }

    AsyncFunction("getAssetsDetails") { (ids: [String], promise: Promise) in
      let assets = ids.compactMap {
        PHAsset.fetchAssets(withLocalIdentifiers: [$0], options: nil).firstObject
      }
      let details = assets.map { $0.toDictionary() }
      promise.resolve(details)
    }.runOnQueue(.global(qos: .background))

    AsyncFunction("getSmartAlbum") { (name: String, promise: Promise) in
      try checkAuth()
      let assets = try self.getAlbum(options: fetchOptions, withName: name)
      promise.resolve(["ids": assets.ids()])
    }

    AsyncFunction("getSimilarPhotos") { (promise: Promise) in
      guard let duplicateDetector else {
        promise.reject(
          Exception(
            name: "HashDuplicateFinderModuleError",
            description: "Duplicate detector is not initialized")
        )
        return
      }
      Task {
        do {
          try await duplicateDetector.findDuplicates(for: .image)
          let results = await intermediateResultsSender?.getPendingResults()
          promise.resolve(results?.toDictionary())
        } catch {
          promise.reject(
            Exception(
              name: "HashDuplicateFinderModuleError",
              description: "Failed to fetch similar photos: \(error.localizedDescription)")
          )
        }
      }
    }.runOnQueue(.global(qos: .utility))

    AsyncFunction("flushResults") { (promise: Promise) in
      Task {
        await intermediateResultsSender?.flush()
        promise.resolve(true)
      }
    }

    AsyncFunction("getBlurryImages") { (promise: Promise) in
      try checkAuth()
      let assets = PHAsset.fetchAssets(with: .image, options: fetchOptions)
      Task {
        await scoringCoordinator.queueAssets(
          assets.array(),
          sender: intermediateResultsSender,
          scorer: .blurry
        )
        promise.resolve(true)
      }
    }

  }

  private func getAlbum(options: PHFetchOptions, withName albumName: String) throws
    -> PHFetchResult<PHAsset>
  {
    let subtype: PHAssetCollectionSubtype? =
      switch albumName {
      case "selfies": .smartAlbumSelfPortraits
      case "livePhotos": .smartAlbumLivePhotos
      case "screenshots": .smartAlbumScreenshots
      case "videos": .smartAlbumVideos
      default: nil
      }
    guard let subtype = subtype else {
      throw NSError(
        domain: "GalleryCleanerKit", code: 1,
        userInfo: [NSLocalizedDescriptionKey: "Invalid album name"])
    }

    let collectionFetch = PHAssetCollection.fetchAssetCollections(
      with: .smartAlbum, subtype: subtype, options: nil)
    guard let collection = collectionFetch.firstObject else {
      throw NSError(
        domain: "GalleryCleanerKit", code: 3,
        userInfo: [NSLocalizedDescriptionKey: "Album not found"])
    }
    let assets = PHAsset.fetchAssets(in: collection, options: options)
    return assets
  }

  private func checkAuth() throws {
    let status = PHPhotoLibrary.authorizationStatus()
    if status == .denied {
      throw NSError(
        domain: "GalleryCleanerKit", code: 2,
        userInfo: [NSLocalizedDescriptionKey: "Photo library access denied"])
    }
  }
}
