actor HashStorage {
  private var hashes: [String: ImageHash] = [:]
  private var processingTasks: [String: Task<ImageHash, Never>] = [:]

  func store(identifier: String, hash: ImageHash) {
    hashes[identifier] = hash
    processingTasks.removeValue(forKey: identifier)
  }

  func get(identifier: String) -> ImageHash? {
    return hashes[identifier]
  }

  func removeAll() {
    hashes.removeAll()
    for task in processingTasks.values {
      task.cancel()
    }
    processingTasks.removeAll()
  }

  func contains(identifier: String) -> Bool {
    return hashes[identifier] != nil
  }

  func getOrCreateProcessingTask(
    for identifier: String, processBlock: @Sendable @escaping () async -> ImageHash
  ) -> Task<ImageHash, Never> {
    // If hash already exists, return it immediately
    if let existingHash = hashes[identifier] {
      return Task { existingHash }
    }

    // If already processing, return existing task
    if let existingTask = processingTasks[identifier] {
      return existingTask
    }

    // Create new processing task
    let task = Task<ImageHash, Never> {
      let hash = await processBlock()
      self.store(identifier: identifier, hash: hash)
      return hash
    }

    processingTasks[identifier] = task
    return task
  }
}
