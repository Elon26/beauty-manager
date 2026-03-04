class UnionFind {
  private var parent: [String: String]
  private var rank: [String: Int]

  init() {
    parent = [:]
    rank = [:]
  }

  func makeSet(x: String) {
    if parent[x] == nil {
      parent[x] = x
      rank[x] = 0
    }
  }

  func find(x: String) -> String {
    if parent[x] != x {
      parent[x] = find(x: parent[x]!)
    }
    return parent[x]!
  }

  func union(x: String, y: String) {
    let rootX = find(x: x)
    let rootY = find(x: y)

    if rootX != rootY {
      if rank[rootX]! < rank[rootY]! {
        parent[rootX] = rootY
      } else if rank[rootX]! > rank[rootY]! {
        parent[rootY] = rootX
      } else {
        parent[rootY] = rootX
        rank[rootX]! += 1
      }
    }
  }
}
