import ExpoModulesCore
import Foundation
import Photos

let blurryImageDetector = BlurryImageDetector()
let similarImageDetector = SimilarImageDetector()
let cameraroll = Cameraroll()

public class CleanerGalleryModule: Module {
  let blurryDetector = NewBlurryDetector()
  let duplicateFinder = NewDuplicateFinder()
  @available(iOS 18.0, *)
  private var aestheticsScorer: AestheticsScorer? {
    AestheticsScorer()
  }

  public func definition() -> ModuleDefinition {
    Name("CleanerGallery")

    AsyncFunction("findBlurryImagesFromGallery") {
      (previousIds: [String], threshold: Double, itemsPerPage: Int, promise: Promise) in
      blurryImageDetector.findBlurryImagesFromGallery(
        previousIds: previousIds, threshold: threshold, itemsPerPage: itemsPerPage,
        resolve: promise.resolve)
    }.runOnQueue(.global(qos: .utility))

    AsyncFunction("findSimilarImagesFromGallery") { (interval: Double, promise: Promise) in
      similarImageDetector.findSimilarImagesFromGallery(
        interval: interval, resolve: promise.resolve)
    }.runOnQueue(.global(qos: .utility))

    AsyncFunction("findSimilarImagesFromGalleryFast") { (interval: Double, promise: Promise) in
      similarImageDetector.findSimilarFast(
        interval: interval
      ) { result in
        let groups = result.map { $0.map { $0.localIdentifier } }
        promise.resolve(groups)
      }
    }.runOnQueue(.global(qos: .utility))

    AsyncFunction("getAssets") { (params: [String: Any], promise: Promise) in
      cameraroll.getAssets(params: params, resolve: promise.resolve, reject: promise.legacyRejecter)
    }.runOnQueue(.global(qos: .utility))

    AsyncFunction("deleteAssets") { (ids: [String], promise: Promise) in
      cameraroll.deleteAssets(ids: ids, resolve: promise.resolve, reject: promise.legacyRejecter)
    }.runOnQueue(.global(qos: .utility))

    AsyncFunction("extractThumbnail") {
      (id: String, filename: URL, width: Int, height: Int, promise: Promise) in
      cameraroll.extractThumbnail(
        id: id, filename: filename, width: width, height: height, resolve: promise.resolve,
        reject: promise.legacyRejecter)
    }.runOnQueue(.global(qos: .utility))

    AsyncFunction("saveAssets") { (files: [String], promise: Promise) in
      cameraroll.saveAssets(files: files, resolve: promise.resolve, reject: promise.legacyRejecter)
    }.runOnQueue(.global(qos: .utility))

    AsyncFunction("newFindSimilarImagesFromGallery") { (promise: Promise) in
      Task {
        let groups = try? await duplicateFinder.findDuplicates(for: .image)
        var result: [[String]] = []

        for group in groups ?? [] {
          var duplicates: [Duplicate] = []
          for asset in group {
            var score: Float?
            if #available(iOS 18.0, *) {
              score = await aestheticsScorer?.aestheticsScore(for: asset)
            } else {
              score = await blurryDetector.sharpnessScore(for: asset)
            }
            let duplicate = Duplicate(id: asset.localIdentifier, score: score ?? 0)
            duplicates.append(duplicate)
          }
          duplicates.sort { $0.score > $1.score }
          result.append(duplicates.map { $0.id })
        }

        promise.resolve(result)
      }
    }.runOnQueue(.global(qos: .utility))

    AsyncFunction("newFindBlurryImagesFromGallery") { (threshold: Float, promise: Promise) in
      Task {
        let found = await blurryDetector.findBlurryImages(threshold: threshold)
        let result = found.map { (asset: PHAsset, score: Float) in
          asset.localIdentifier
        }
        promise.resolve(result)
      }
    }.runOnQueue(.global(qos: .utility))

    AsyncFunction("getAssetsDetails") { (ids: [String], promise: Promise) in
      let assets = ids.compactMap {
        PHAsset.fetchAssets(withLocalIdentifiers: [$0], options: nil).firstObject
      }
      let details = assets.map { $0.toDictionary() }
      promise.resolve(details)
    }.runOnQueue(.global(qos: .utility))
  }
}

struct Duplicate {
  let id: String
  let score: Float
}
