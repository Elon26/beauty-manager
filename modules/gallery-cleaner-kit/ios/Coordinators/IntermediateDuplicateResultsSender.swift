import Foundation
import Photos

actor IntermediateDuplicateResultsSender {
  private var pendingResults = DuplicatesResult()
  private var sendTask: Task<Void, Never>?
  private var lastSendTime: Date = .distantPast
  private let sendInterval: TimeInterval = 3.0
  private let sendResults: ((DuplicatesResult) -> Void)
  private var hasPendingChanges = false

  init(sendResults: @escaping ((DuplicatesResult) -> Void)) {
    self.sendResults = sendResults
  }

  func getPendingResults() -> DuplicatesResult {
    return pendingResults
  }

  func addGroup(_ assets: [PHAsset]) {
    let duplicates = DuplicateGroup(id: UUID(), assets: assets)
    var mutable = pendingResults.mutableCopy()
    let group = duplicates.sorted(with: mutable.aestheticsScores)

    mutable.similarPhotoGroups.append(group)
    mutable.similarPhotoGroups.sort { a, b in
      a.assets.first?.creationDate ?? Date.distantPast > b.assets.first?.creationDate
        ?? Date.distantPast
    }

    pendingResults = mutable.freeze()
    hasPendingChanges = true
    scheduleSend()
  }

  func addAestheticsScores(_ scores: [(id: String, score: Float)]) {
    var mutable = pendingResults.mutableCopy()
    for (id, score) in scores {
      mutable.aestheticsScores[id] = score
    }

    mutable.similarPhotoGroups = mutable.similarPhotoGroups.map {
      if #available(iOS 18.0, *) {
        return $0.sorted(with: mutable.aestheticsScores)
      } else {
        return $0.sorted(with: mutable.blurScores)
      }
    }

    pendingResults = mutable.freeze()
    hasPendingChanges = true
    scheduleSend()
  }

  func addBlurScores(_ scores: [(id: String, score: Float)]) {
    var mutable = pendingResults.mutableCopy()
    for (id, score) in scores {
      let scoreNormalized = score * 1e2
      mutable.blurScores[id] = scoreNormalized
      if scoreNormalized < 1 {
        mutable.blurryImages[id] = scoreNormalized
      }
    }

    pendingResults = mutable.freeze()
    hasPendingChanges = true
    scheduleSend()
  }

  private func scheduleSend() {
    // If already scheduled, mark that we have pending changes and let the existing task handle it
    guard sendTask == nil else {
      hasPendingChanges = true
      return
    }

    let timeSinceLastSend = Date().timeIntervalSince(lastSendTime)
    let timeUntilNextSend = max(0, sendInterval - timeSinceLastSend)

    sendTask = Task { [weak self] in
      repeat {
        guard let self else { return }

        if timeUntilNextSend > 0 {
          try? await Task.sleep(nanoseconds: UInt64(timeUntilNextSend * 1_000_000_000))
        }

        if Task.isCancelled { return }

        await self.sendPendingResults()
        await self.resetPendingChanges()

        // Check if new changes came in while we were sending
        let shouldContinue = await self.hasPendingChanges
        if !shouldContinue {
          break
        }

        // Wait for the interval before sending again
        try? await Task.sleep(nanoseconds: UInt64(self.sendInterval * 1_000_000_000))
      } while true

      await self?.clearSendTask()
    }
  }

  private func clearSendTask() {
    sendTask = nil
  }

  private func resetPendingChanges() {
    hasPendingChanges = false
  }

  private func sendPendingResults() {
    lastSendTime = Date()
    sendResults(pendingResults)
  }

  func flush() async {
    sendTask?.cancel()
    sendTask = nil
    pendingResults = DuplicatesResult()
  }
}
