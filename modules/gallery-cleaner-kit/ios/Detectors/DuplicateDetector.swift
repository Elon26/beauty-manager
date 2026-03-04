import Photos
import UIKit

final class DuplicateDetector {
  var similarityThreshold: Double = 0.9
  var thumbnailSize: Int = 32
  private let hashCache: Cache<ImageHash>

  var onLookupStarted: (() -> Void)?
  var onLookupFinished: (() -> Void)?
  var onLookupProgressChange: ((Double) -> Void)?
  var onLookupError: ((Error) -> Void)?
  var onDuplicatesFound: (([[PHAsset]]) -> Void)?

  private var totalAssets: Int = 0
  private var currentAssetIndex: Int = 0 {
    didSet {
      let percentage = Double(currentAssetIndex) / Double(totalAssets)
      onLookupProgressChange?(percentage * 100)
    }
  }

  private var maxConcurrentTasks: Int {
    let memoryGB = Double(ProcessInfo.processInfo.physicalMemory) / 1_073_741_824
    if memoryGB < 4 {
      return 5  // Low memory devices
    } else if memoryGB < 8 {
      return 10  // Mid-range devices
    } else {
      return 15  // High-end devices
    }
  }

  private enum FinderErrors: Error {
    case authorizationDenied
  }

  init(threshold: Double = 0.9, thumbnailSize: Int = 8, hashCache: Cache<ImageHash>) {
    self.similarityThreshold = threshold
    self.thumbnailSize = thumbnailSize
    self.hashCache = hashCache
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

  @discardableResult
  func findDuplicates(for type: PHAssetMediaType) async throws -> [[PHAsset]] {
    onLookupStarted?()
    defer {
      onLookupFinished?()
    }
    let status = PHPhotoLibrary.authorizationStatus()
    guard status == .authorized else { throw FinderErrors.authorizationDenied }

    let fetchOptions = PHFetchOptions()
    fetchOptions.sortDescriptors = [NSSortDescriptor(key: "creationDate", ascending: false)]
    fetchOptions.includeAssetSourceTypes = [.typeUserLibrary]
    // Remove the screenshot predicate - we'll filter screenshots later
    // fetchOptions.predicate = NSPredicate(format: "(mediaSubtype & %d) == 0", PHAssetMediaSubtype.photoScreenshot.rawValue)

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

    // Final filter to ensure no screenshots in results
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

    let chunks = stride(from: 0, to: assets.count, by: maxConcurrentTasks).map {
      Array(assets[$0..<min($0 + maxConcurrentTasks, assets.count)])
    }

    // Phase 1: Compute hashes for all images (with limited concurrency)
    for chunk in chunks {
      await withTaskGroup(of: Void.self) { [weak self] group in
        guard let self else { return }
        for asset in chunk {
          group.addTask {
            let task = await self.hashCache.getOrCreateTask(
              for: asset.localIdentifier
            ) {
              await self.processAssetImage(asset, imageManager: imageManager)
            }
            let _ = await task.value
            self.currentAssetIndex += 1
          }
        }
      }
    }

    // Phase 2: Set up union-find structure
    let unionFind = UnionFind()
    var assetLookup: [String: PHAsset] = [:]

    for asset in assets {
      let identifier = asset.localIdentifier
      assetLookup[identifier] = asset
      unionFind.makeSet(x: identifier)
    }

    // Phase 3: Compare ALL pairs of assets
    for i in 0..<assets.count {
      let asset1 = assets[i]
      let identifier1 = asset1.localIdentifier

      guard let hash1: ImageHash = await hashCache.get(identifier: identifier1)
      else {
        continue
      }

      for j in (i + 1)..<assets.count {
        let asset2 = assets[j]
        let identifier2 = asset2.localIdentifier

        guard let hash2: ImageHash = await hashCache.get(identifier: identifier2)
        else {
          continue
        }

        let similarity = compareHashes(hash1, hash2)

        if similarity >= similarityThreshold {
          unionFind.union(x: identifier1, y: identifier2)
        }
      }
    }

    // Phase 4: Build groups from union-find structure
    var groups: [String: [String]] = [:]
    for assetId in assetLookup.keys {
      // Skip screenshots when building groups
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

    if !resultGroups.isEmpty {
      onDuplicatesFound?(resultGroups)
    }

    return resultGroups
  }

  private func processAssetImage(_ asset: PHAsset, imageManager: PHImageManager) async -> ImageHash
  {
    return await withCheckedContinuation { continuation in
      let requestOptions = PHImageRequestOptions()
      requestOptions.isNetworkAccessAllowed = false
      requestOptions.isSynchronous = false
      requestOptions.version = .current
      requestOptions.resizeMode = .fast
      requestOptions.deliveryMode = .highQualityFormat
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
    let useRGB = true

    guard let cgImage = image.cgImage else {
      return ImageHash.empty(for: thumbnailSize)
    }

    let width = thumbnailSize
    let height = thumbnailSize

    if !useRGB {
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

      return ImageHash(fromGrayscale: pixelData, thumbnailSize: thumbnailSize)
    } else {
      let bytesPerPixel = 4
      let bitsPerComponent = 8
      let bytesPerRow = width * bytesPerPixel

      var pixelData = [UInt8](repeating: 0, count: width * height * bytesPerPixel)

      let colorSpace = CGColorSpaceCreateDeviceRGB()

      guard
        let context = CGContext(
          data: &pixelData,
          width: width,
          height: height,
          bitsPerComponent: bitsPerComponent,
          bytesPerRow: bytesPerRow,
          space: colorSpace,
          bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue
        )
      else {
        return ImageHash.empty(for: thumbnailSize)
      }

      context.draw(cgImage, in: CGRect(x: 0, y: 0, width: width, height: height))

      return ImageHash(fromRGB: pixelData, thumbnailSize: thumbnailSize)
    }
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