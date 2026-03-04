# Gallery Cleaner Kit - iOS Architecture

## 📁 Project Structure

```
ios/
├── Cache/                                      (Modern Cache Factory Pattern)
│   ├── Cache.swift                            - Generic Cache<T> actor
│   ├── CacheFactory.swift                     - Singleton factory for cache instances
│   ├── CacheType.swift                        - Enum for cache types (legacy support)
│   ├── CacheValue.swift                       - Protocol for serializable values
│   └── HashStorage.swift                      - Legacy monolithic cache (deprecated)
│
├── Coordinators/                               (Orchestration layer)
│   ├── IntermediateDuplicateResultsSender.swift - Actor managing results & debounced sending
│   └── JSEventsDelegate.swift                 - Bridge to React Native events
│
├── Detectors/                                  (Detection & scoring algorithms)
│   ├── DuplicateDetector.swift                - Perceptual hash-based duplicate finder
│   ├── AestheticsScorer.swift                 - iOS 18+ Vision-based aesthetic scoring
│   ├── BlurryDetector.swift                   - Detects blurry images
│   └── BlurCalculatorGPU.swift                - GPU-accelerated blur calculation
│
├── Models/                                     (Data structures)
│   ├── DuplicateGroup.swift                   - Represents a group of duplicates
│   ├── DuplicatesResult.swift                 - Results container with scores
│   ├── ImageHash.swift                        - Perceptual hash representation
│   └── UnionFind.swift                        - Union-find data structure
│
├── Utils/                                      (Extensions & helpers)
│   ├── PHAsset+toDictionary.swift             - PHAsset serialization
│   ├── PHFetchResult+array.swift              - PHFetchResult helpers
│   └── UIImageOrientation+CGImagePropertyOrientation.swift
│
└── GalleryCleanerKitModule.swift              - Main Expo module (orchestrator)
```

## 🏗 Architecture Overview

### Core Components

#### 1. **GalleryCleanerKitModule** (Main Orchestrator)
- Entry point for React Native
- Wires up all components with proper lifecycle
- Coordinates detection and scoring flows
- Manages `CacheFactory` singleton

#### 2. **Cache Factory Pattern** ⭐️ NEW
Modern, modular caching system replacing the monolithic `HashStorage`.

**CacheFactory** - Singleton managing specialized cache instances:
```swift
let factory = CacheFactory.shared

// Type-safe, independent caches
factory.hashCache: Cache<ImageHash>          // Perceptual hashes
factory.aestheticScoreCache: Cache<Float>    // Aesthetic scores
factory.blurScoreCache: Cache<Float>         // Blur scores
```

**Cache<T>** - Generic cache actor:
- Type-safe storage for any `CacheValue` conforming type
- Automatic task deduplication (multiple requests = single calculation)
- Independent disk persistence per cache type
- Debounced writes (2s) to minimize I/O
- Thread-safe via Swift actor isolation

**Benefits over HashStorage:**
- ✅ Type-safe (no casting required)
- ✅ Modular (each cache is independent)
- ✅ Simpler (no enum-based routing)
- ✅ Testable (easy to mock)
- ✅ Scalable (add caches without modifying existing code)

#### 3. **DuplicateDetector** (Stateless Finder)
- Finds duplicate images using perceptual hashing
- Callback-based architecture for loose coupling
- Pre-filtering with bucketing (dimensions + location)
- Union-find algorithm for efficient grouping
- Memory-aware concurrency limits
- Works with `Cache<ImageHash>` directly

#### 4. **IntermediateDuplicateResultsSender** (Actor)
- Accumulates duplicate groups and scores
- Debounced sending to React Native (3s intervals)
- Re-sorts groups when new scores arrive
- Thread-safe result mutations
- Handles progressive updates elegantly

#### 5. **ScoringCoordinator** (Actor - Single Queue Processor)
- Centralized queue for all assets from all duplicate batches
- Processes assets in controlled batches (default: 2 concurrent)
- Waits for each batch to complete before starting next
- Prevents cache actor congestion and PHImageManager overload
- Auto-starts when assets queued, auto-stops when queue empty
- Single background processor - no competing tasks

#### 6. **Scorers** (AestheticsScorer, BlurryDetector)
- Calculate quality metrics for images
- Aesthetic scores: iOS 18+ Vision framework
- Blur scores: GPU-accelerated Laplacian calculation
- Work with `Cache<Float>` for automatic caching

## 🔄 Data Flow

```
1. JS calls getSimilarPhotos()
   ↓
2. DuplicateDetector.findDuplicates()
   ├─→ Hashes images (cached in CacheFactory.hashCache)
   ├─→ Buckets by dimensions + location (pre-filtering)
   ├─→ Groups duplicates (union-find algorithm)
   └─→ Calls onDuplicatesFound callback (per bucket)
   ↓
3. GalleryCleanerKitModule callback:
   ├─→ Send groups to IntermediateDuplicateResultsSender (immediate)
   └─→ Queue assets to ScoringCoordinator.queueAssets() (non-blocking)
   ↓
4. ScoringCoordinator (single background processor):
   ├─→ Accumulates assets from all duplicate batches into single queue
   ├─→ Processes queue in batches of maxConcurrent (default: 2)
   ├─→ Waits for entire batch to complete before next batch
   ├─→ Each asset checks CacheFactory.aestheticScoreCache first
   ├─→ Calculates score if not cached
   └─→ Sends each score immediately (no batching)
   ↓
5. IntermediateDuplicateResultsSender:
   ├─→ Accumulates all groups and scores
   ├─→ Re-sorts groups when scores update
   └─→ Debounces & sends to JS every 3s
   ↓
6. JSEventsDelegate → React Native
   └─→ onIntermediateResult events
```

## 🎯 Key Design Patterns

### 1. Cache Factory Pattern
```swift
// OLD: Monolithic HashStorage
let storage = HashStorage(versionTag: "v1")
await storage.store(identifier: id, value: hash, type: .hash)
let hash: ImageHash? = await storage.get(identifier: id, type: .hash)

// NEW: Modular Cache Factory
let factory = CacheFactory.shared
await factory.hashCache.store(identifier: id, value: hash)
let hash = await factory.hashCache.get(identifier: id)

// Type inference works automatically!
// No more generic type parameters or casting
```

### 2. Actor Isolation
- `Cache<T>`: Protects cache state per type
- `IntermediateDuplicateResultsSender`: Protects result state
- `ScoringCoordinator`: Protects queue and task tracking
- Automatic thread safety without locks or semaphores

### 3. Task Deduplication
```swift
// Multiple concurrent calls for same asset
let task1 = await cache.getOrCreateTask(for: "asset123") {
  await calculateScore()
}
let task2 = await cache.getOrCreateTask(for: "asset123") {
  await calculateScore()
}

// Both return the SAME task - calculation only runs once
// Second call gets the already-running task's result
```

### 4. Batched Queue Processing
```swift
// ScoringCoordinator: Process queue in controlled batches
while !pendingAssets.isEmpty {
  let batchSize = min(maxConcurrent, pendingAssets.count)
  let batch = Array(pendingAssets.prefix(batchSize))
  pendingAssets.removeFirst(batchSize)

  // Process batch concurrently
  await withTaskGroup(of: Void.self) { group in
    for asset in batch {
      group.addTask {
        await self.scoreAndSendAsset(asset)
      }
    }
    // Wait for ALL in batch to complete
    for await _ in group {}
  }
}

// Result: Controlled concurrency (2 concurrent by default)
// Prevents cache actor congestion & PHImageManager overload
// Single coordinator prevents multiple competing processors
```

## 📊 Component Classification

### By Type
- **Actors**: `Cache<T>`, `IntermediateDuplicateResultsSender`, `ScoringCoordinator`
- **Classes**: `CacheFactory`, Detectors, Scorers (algorithms)
- **Structs**: All models (immutable data)
- **Enums**: `CacheType` (legacy support)
- **Protocols**: `CacheValue` (serialization interface)

### By Responsibility
- **Cache/**: Modular, type-safe caching with factory pattern
- **Coordinators/**: Orchestration and React Native communication
- **Detectors/**: Image analysis algorithms
- **Models/**: Pure data structures
- **Utils/**: Extensions and helpers

## 🚀 Adding New Features

### Adding a New Score Type

**1. Add cache to CacheFactory:**
```swift
// Cache/CacheFactory.swift
public private(set) lazy var newScoreCache: Cache<Float> = {
  Cache<Float>(name: "new_scores_v1", storageKey: "newScores")
}()
```

**2. Add to DuplicatesResult:**
```swift
// Models/DuplicatesResult.swift
let newScores: [String: Float]

func toDictionary() -> [String: Any] {
  [
    "similarPhotoGroups": similarPhotoGroups.map { $0.toDictionary() },
    "aestheticsScores": aestheticsScores,
    "blurScores": blurScores,
    "newScores": newScores  // ← Add here
  ]
}
```

**3. Add sender method:**
```swift
// Coordinators/IntermediateDuplicateResultsSender.swift
func addNewScores(_ scores: [(id: String, score: Float)]) {
  var mutable = pendingResults.mutableCopy()
  for (id, score) in scores {
    mutable.newScores[id] = score
  }
  pendingResults = mutable.freeze()
  scheduleSend()
}
```

**4. Use in scoring:**
```swift
// GalleryCleanerKitModule.swift or custom scorer
let cache = CacheFactory.shared.newScoreCache
let task = await cache.getOrCreateTask(for: assetId) {
  return await calculateNewScore(for: asset)
}
let score = await task.value
```

**That's it! No enum updates, no switch statements, fully type-safe.**

### Adding a New Detector

1. Create new file in `Detectors/`
2. Follow pattern: class with async methods
3. Accept `Cache<T>` for caching if needed
4. Wire up in `GalleryCleanerKitModule`
5. Add exports to React Native via `AsyncFunction`

## 🎨 Code Style

- **Actors** for mutable state
- **Structs** for immutable data
- **Async/await** for concurrency
- **Callbacks** for loose coupling
- **Task groups** for parallel work
- **Sendable** for thread-safe types
- **Public** APIs for cross-module access

## 🐛 Troubleshooting

### Build Errors

**Error: "Generic actor cannot be declared public"**
```
Solution: Make CacheValue protocol public
public protocol CacheValue: Sendable { ... }
```

**Error: "Property cannot be declared public because its type uses an internal type"**
```
Solution: Make all referenced types public:
- public struct ImageHash
- public enum CacheType
- public protocol CacheValue
```

**Error: "Method must be declared public because it matches requirement"**
```
Solution: Make protocol extension methods public:
extension ImageHash: CacheValue {
  public func serialize() -> Any { ... }
  public static func deserialize(from data: Any) -> ImageHash? { ... }
}
```

### Runtime Issues

**Symptom: Scoring hangs or never completes**
```
Cause: Multiple concurrent ScoringCoordinator tasks competing for resources
Solution: Use single queue processor pattern
All duplicate batches queue to ONE coordinator
Coordinator processes in controlled batches, waiting between batches
Prevents cache actor congestion and PHImageManager overload
```

**Symptom: Only first group appears**
```
Cause: scheduleSend() returns early if sendTask exists
Solution: Use hasPendingChanges flag
The sender now loops until no pending changes
```

**Symptom: Stale diagnostics errors**
```
Cause: LSP/SourceKit caching old file paths
Solution: Run npx pod-install or clean build
cd ios && rm -rf Pods Podfile.lock && pod install
```

## 📝 Technical Notes

- **Minimum iOS**: 13.0
- **Aesthetic scoring**: Requires iOS 18.0+ (Vision framework)
- **GPU blur**: Uses Metal framework
- **Cache files**: Stored in Documents directory as JSON
  - `cache_hashes_v1.json`
  - `cache_aesthetic_scores_v1.json`
  - `cache_blur_scores_v1.json`
- **Cache versioning**: Change version in name to invalidate old cache
- **Concurrency**: Rate-limited to prevent overwhelming Vision/Metal
- **Memory**: Detector adjusts concurrency based on device RAM

## 🔄 Migration Guide

### From HashStorage to Cache Factory

**Before:**
```swift
let storage = HashStorage(versionTag: "v1")

// Storing
await storage.store(identifier: id, value: hash, type: .hash)
await storage.store(identifier: id, value: 0.85, type: .aestheticScore)

// Retrieving (requires type annotation)
let hash: ImageHash? = await storage.get(identifier: id, type: .hash)
let score: Float? = await storage.get(identifier: id, type: .aestheticScore)

// Tasks
let task = await storage.getOrCreateTask(for: id, type: .aestheticScore) {
  await calculate()
}
```

**After:**
```swift
let factory = CacheFactory.shared

// Storing (type-safe)
await factory.hashCache.store(identifier: id, value: hash)
await factory.aestheticScoreCache.store(identifier: id, value: 0.85)

// Retrieving (type inference!)
let hash = await factory.hashCache.get(identifier: id)
let score = await factory.aestheticScoreCache.get(identifier: id)

// Tasks (simpler)
let task = await factory.aestheticScoreCache.getOrCreateTask(for: id) {
  await calculate()
}
```

## 🎯 Performance Characteristics

- **Detection**: Parallel bucket processing, O(n²) within buckets
- **Scoring**: Batched processing with max 2 concurrent tasks by default
- **Caching**: O(1) lookup, debounced disk writes, automatic task deduplication
- **Sending**: Debounced every 3s, individual scores sent immediately
- **Memory**: Adjusted concurrency based on device capabilities

## 📚 Further Reading

- [Swift Actors](https://docs.swift.org/swift-book/documentation/the-swift-programming-language/concurrency/#Actors)
- [Vision Framework](https://developer.apple.com/documentation/vision)
- [Metal Performance Shaders](https://developer.apple.com/documentation/metalperformanceshaders)
- [PHPhotoLibrary](https://developer.apple.com/documentation/photokit/phphotolibrary)
