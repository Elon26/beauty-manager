import Photos

actor ScoringCoordinator {
  private let maxConcurrent: Int
  private var pendingAssets: [PHAsset] = []
  private var isProcessing = false
  private var processedCount = 0
  private weak var sender: IntermediateDuplicateResultsSender?
  private let cacheFactory = CacheFactory.shared
  private let blurryDetector = BlurryDetector()
  @available(iOS 18.0, *)
  private var aestheticsScorer: AestheticsScorer? {
    AestheticsScorer()
  }

  enum Scorer {
    case blurry
    case auto
  }

  init(maxConcurrent: Int = 5) {
    self.maxConcurrent = maxConcurrent
  }

  /// Queue assets for processing - they'll be processed by the single background processor
  func queueAssets(
    _ assets: [PHAsset],
    sender: IntermediateDuplicateResultsSender?,
    scorer: Scorer
  ) async {
    guard !assets.isEmpty else { return }

    // Store sender reference on first call
    if self.sender == nil {
      self.sender = sender
    }
    pendingAssets.append(contentsOf: assets)
    // Start processing if not already running
    if !isProcessing {
      isProcessing = true
      Task {
        await self.processQueue(scorer: scorer)
      }
    }
  }

  /// Process the queue with controlled concurrency
  private func processQueue(scorer: Scorer) async {
    while !pendingAssets.isEmpty {
      let batchSize = min(maxConcurrent, pendingAssets.count)
      let batch = Array(pendingAssets.prefix(batchSize))
      pendingAssets.removeFirst(batchSize)

      // Process batch concurrently
      await withTaskGroup(of: Void.self) { group in
        for (index, asset) in batch.enumerated() {
          group.addTask {
            await self.scoreAndSendAsset(
              asset,
              sender: self.sender,
              index: self.processedCount + index,
              scorer: scorer
            )
          }
        }

        // Wait for all in batch to complete
        for await _ in group {}
      }

      processedCount += batch.count
    }

    isProcessing = false
  }

  private func scoreAndSendAsset(
    _ asset: PHAsset,
    sender: IntermediateDuplicateResultsSender?,
    index: Int,
    scorer: Scorer
  ) async {
    let identifier = asset.localIdentifier

    if #available(iOS 18.0, *), scorer == .auto {
      // Access aestheticsScorer outside closure to avoid actor isolation issue
      let aestheticsScorer = self.aestheticsScorer
      let task = await cacheFactory.aestheticScoreCache.getOrCreateTask(
        for: identifier
      ) {
        if let scorer = aestheticsScorer {
          return await scorer.aestheticsScore(for: asset) ?? 0.0
        }
        return 0.0
      }

      let score = await task.value

      if score > 0.0 {
        await sender?.addAestheticsScores([(identifier, score)])
      }
    } else {
      // Get or calculate blur score
      let task = await cacheFactory.blurScoreCache.getOrCreateTask(
        for: identifier
      ) {
        return await self.blurryDetector.calculateBlurScore(for: asset) ?? 0.0
      }

      let score = await task.value

      if score > 0.0 {
        await sender?.addBlurScores([(identifier, score)])
      }
    }
  }
}
