import Photos
import UIKit

final class NewDuplicateFinder {
  typealias DuplicateGroup = [PHAsset]

  var similarityThreshold: Double = 0.90
  var thumbnailSize: Int = 8
  private let hashStorage: HashStorage
  var delegate: DuplicateDetectorDelegate?
  private var totalAssets: Int = 0
  private var currentAssetIndex: Int = 0 {
    didSet {
      let percentage = Double(currentAssetIndex) / Double(totalAssets)
      delegate?.onProgressChange(Int(percentage * 100))
    }
  }

  private enum FinderErrors: Error {
    case authorizationDenied
  }

  init(threshold: Double = 0.95, thumbnailSize: Int = 8, hashStorage: HashStorage = HashStorage()) {
    self.similarityThreshold = threshold
    self.thumbnailSize = thumbnailSize
    self.hashStorage = hashStorage
  }

  private func prefilterAssets(_ assets: PHFetchResult<PHAsset>) -> [String: [PHAsset]] {
    var buckets: [String: [PHAsset]] = [:]
    for i in 0..<assets.count {
      let asset = assets[i]
      
      // Include all assets, including screenshots, for proper bucketing
      let width = Int(asset.pixelWidth / 10) * 10
      let height = Int(asset.pixelHeight / 10) * 10
      let lat = Int((asset.location?.coordinate.latitude ?? 0) * 100)
      let lon = Int((asset.location?.coordinate.longitude ?? 0) * 100)
      let key = "\(width)x\(height)_\(lat)_\(lon)"
      if buckets[key] == nil {
        buckets[key] = []
      }
      buckets[key]?.append(asset)
    }
    return buckets.filter { $0.value.count > 1 }
  }

  func findDuplicates(for type: PHAssetMediaType) async throws -> [[PHAsset]] {
    delegate?.onLookupStarted()
    defer {
      delegate?.onLookupFinished()
    }

    let status = PHPhotoLibrary.authorizationStatus()
    guard status == .authorized else { throw FinderErrors.authorizationDenied }

    let fetchOptions = PHFetchOptions()
    fetchOptions.sortDescriptors = [NSSortDescriptor(key: "creationDate", ascending: false)]
    fetchOptions.includeAssetSourceTypes = [.typeUserLibrary]

    let assets = PHAsset.fetchAssets(with: type, options: fetchOptions)
    guard assets.count > 0 else { return [] }

    totalAssets = assets.count
    currentAssetIndex = 0

    let buckets = prefilterAssets(assets)
    let assetsLeft = buckets.flatMap { $0.value }
    currentAssetIndex = totalAssets - assetsLeft.count

    var allDuplicateGroups: [[PHAsset]] = []
    await withTaskGroup(of: [[PHAsset]].self) { [weak self] group in
      for (_, bucketAssets) in buckets {
        group.addTask {
          await self?.processAssetBucket(bucketAssets) ?? []
        }
      }
      for await duplicateGroups in group {
        allDuplicateGroups.append(contentsOf: duplicateGroups)
      }
    }

    let filteredGroups = allDuplicateGroups.filter { group in
      !group.contains { $0.mediaSubtypes.contains(.photoScreenshot) }
    }

    let defaultDate = Date(timeIntervalSince1970: 0)
    let sorted = filteredGroups.sorted {
      $0[0].creationDate ?? defaultDate > $1[0].creationDate ?? defaultDate
    }
    return sorted
  }

  private func processAssetBucket(_ assets: [PHAsset]) async -> [[PHAsset]] {
    let imageManager = PHImageManager.default()
    await withTaskGroup(of: Void.self) { [weak self] group in
      guard let self else { return }
      for asset in assets {
        group.addTask {
          let task = await self.hashStorage.getOrCreateProcessingTask(for: asset.localIdentifier) {
            await self.processAssetImage(asset, imageManager: imageManager)
          }
          let _ = await task.value
          self.currentAssetIndex += 1
        }
      }
      for await _ in group {}
    }

    let unionFind = UnionFind()
    var assetLookup: [String: PHAsset] = [:]
    for asset in assets {
      let identifier = asset.localIdentifier
      assetLookup[identifier] = asset
      unionFind.makeSet(x: identifier)
    }

    var assetsToProcess = assets
    while !assetsToProcess.isEmpty {
      let asset1 = assetsToProcess.removeFirst()
      let identifier1 = asset1.localIdentifier
      guard let hash1 = await hashStorage.get(identifier: identifier1) else { continue }
      var i = 0
      while i < assetsToProcess.count {
        let asset2 = assetsToProcess[i]
        let identifier2 = asset2.localIdentifier
        guard let hash2 = await hashStorage.get(identifier: identifier2) else {
          i += 1
          continue
        }
        let similarity = compareHashes(hash1, hash2)
        if similarity >= similarityThreshold {
          unionFind.union(x: identifier1, y: identifier2)
          assetsToProcess.remove(at: i)
        } else {
          i += 1
        }
      }
    }

    var groups: [String: [String]] = [:]
    for assetId in assetLookup.keys {
      guard let asset = assetLookup[assetId],
            !asset.mediaSubtypes.contains(.photoScreenshot) else {
        continue
      }
      
      let root = unionFind.find(x: assetId)
      if groups[root] == nil {
        groups[root] = []
      }
      groups[root]?.append(assetId)
    }

    let resultGroups = groups.values
      .filter { $0.count > 1 }
      .map { group in
        group.compactMap { assetLookup[$0] }
      }

    if let onDuplicatesFound = delegate?.onDuplicatesFound {
      for result in resultGroups {
        onDuplicatesFound(result)
      }
    }
    return resultGroups
  }

  private func processAssetImage(_ asset: PHAsset, imageManager: PHImageManager) async -> ImageHash {
    return await withCheckedContinuation { continuation in
      let requestOptions = PHImageRequestOptions()
      requestOptions.isNetworkAccessAllowed = true
      requestOptions.isSynchronous = false
      requestOptions.version = .current
      requestOptions.resizeMode = .fast
      requestOptions.deliveryMode = .fastFormat
      #if targetEnvironment(simulator)
        requestOptions.deliveryMode = .highQualityFormat
      #endif
      imageManager.requestImage(
        for: asset,
        targetSize: CGSize(width: self.thumbnailSize, height: self.thumbnailSize),
        contentMode: .aspectFill,
        options: requestOptions
      ) { [weak self] (image, info) in
        guard let self, let image else {
          continuation.resume(returning: ImageHash.empty(for: self?.thumbnailSize ?? 0))
          return
        }
        let hash = self.calculateAverageHash(for: image)
        continuation.resume(returning: hash)
      }
    }
  }

  private func calculateAverageHash(for image: UIImage) -> ImageHash {
    guard let cgImage = image.cgImage else {
      return ImageHash.empty(for: thumbnailSize)
    }
    let width = thumbnailSize
    let height = thumbnailSize
    let totalBytes = width * height
    let colorSpace = CGColorSpaceCreateDeviceGray()
    var pixelData = [UInt8](repeating: 0, count: totalBytes)
    guard
      let context = CGContext(
        data: &pixelData,
        width: width,
        height: height,
        bitsPerComponent: 8,
        bytesPerRow: width,
        space: colorSpace,
        bitmapInfo: CGImageAlphaInfo.none.rawValue
      )
    else {
      return ImageHash.empty(for: thumbnailSize)
    }
    context.draw(cgImage, in: CGRect(x: 0, y: 0, width: width, height: height))
    return ImageHash(from: pixelData, thumbnailSize: thumbnailSize)
  }

  private func compareHashes(_ hash1: ImageHash, _ hash2: ImageHash) -> Double {
    guard hash1.thumbnailSize == hash2.thumbnailSize else { return 0.0 }
    guard !hash1.isEmpty && !hash2.isEmpty else { return 0.0 }
    guard hash1 != hash2 else { return 1.0 }
    let xor = hash1 ^ hash2
    let totalDifferences = xor.bitCount
    let totalBits = hash1.thumbnailSize * hash1.thumbnailSize * 2
    return 1.0 - (Double(totalDifferences) / Double(totalBits))
  }
}

protocol DuplicateDetectorDelegate: AnyObject {
  func onLookupStarted()
  func onProgressChange(_ progress: Int)
  func onDuplicatesFound(_ duplicates: NewDuplicateFinder.DuplicateGroup)
  func onLookupFinished()
}