import Foundation

/// Generic cache actor for storing and retrieving values with disk persistence
actor Cache<Value: CacheValue> {
  private var storage: [String: Value] = [:]
  private var processingTasks: [String: Task<Value, Never>] = [:]

  private let cacheFileName: String
  private let storageKey: String

  private var saveTask: Task<Void, Never>?
  private let saveDebounceInterval: TimeInterval = 2.0
  private var pendingSave = false

  private var cacheFileURL: URL {
    let documentsPath = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)
      .first!
    return documentsPath.appendingPathComponent(cacheFileName)
  }

  init(name: String, storageKey: String) {
    self.cacheFileName = "cache_\(name).json"
    self.storageKey = storageKey
    Task {
      await loadFromDisk()
    }
  }

  // MARK: - Public API

  func store(identifier: String, value: Value) {
    storage[identifier] = value
    processingTasks.removeValue(forKey: identifier)
    scheduleSave()
  }

  func get(identifier: String) -> Value? {
    return storage[identifier]
  }

  func contains(identifier: String) -> Bool {
    return storage[identifier] != nil
  }

  func getOrCreateTask(
    for identifier: String,
    processBlock: @Sendable @escaping () async -> Value
  ) -> Task<Value, Never> {
    // Return existing value immediately
    if let existingValue = storage[identifier] {
      return Task { existingValue }
    }

    // Return existing task
    if let existingTask = processingTasks[identifier] {
      return existingTask
    }

    // Create new task
    let task = Task<Value, Never> {
      let value = await processBlock()
      self.store(identifier: identifier, value: value)
      return value
    }

    processingTasks[identifier] = task
    return task
  }

  func invalidate(identifier: String) {
    storage.removeValue(forKey: identifier)
    processingTasks[identifier]?.cancel()
    processingTasks.removeValue(forKey: identifier)
    scheduleSave()
  }

  func removeAll() {
    storage.removeAll()
    for task in processingTasks.values {
      task.cancel()
    }
    processingTasks.removeAll()
    scheduleSave()
  }

  // MARK: - Persistence

  private func scheduleSave() {
    pendingSave = true
    saveTask?.cancel()

    saveTask = Task {
      try? await Task.sleep(nanoseconds: UInt64(self.saveDebounceInterval * 1_000_000_000))
      guard !Task.isCancelled, await self.pendingSave else { return }
      await self.resetPendingSave()
      await self.saveToDisk()
    }
  }

  private func resetPendingSave() {
    pendingSave = false
  }

  private func saveToDisk() {
    let serializedData = storage.mapValues { $0.serialize() }
    let storageData: [String: Any] = [storageKey: serializedData]

    do {
      let data = try JSONSerialization.data(withJSONObject: storageData)
      try data.write(to: cacheFileURL)
    } catch {
      print("❌ Failed to save cache '\(storageKey)': \(error)")
    }
  }

  private func loadFromDisk() {
    guard FileManager.default.fileExists(atPath: cacheFileURL.path) else {
      return
    }

    do {
      let data = try Data(contentsOf: cacheFileURL)
      let storageData = try JSONSerialization.jsonObject(with: data) as? [String: Any] ?? [:]

      if let cachedData = storageData[storageKey] as? [String: Any] {
        for (identifier, serializedValue) in cachedData {
          if let value = Value.deserialize(from: serializedValue) {
            storage[identifier] = value
          }
        }
        print("✅ Loaded \(storage.count) items from cache '\(storageKey)'")
      }
    } catch {
      print("❌ Failed to load cache '\(storageKey)': \(error)")
    }
  }
}
