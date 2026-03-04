func bigramSimilarity(_ s1: String, _ s2: String) -> Double {
  // Handle empty strings
  if s1.isEmpty || s2.isEmpty {
    return 0.0
  }

  // Convert strings to bigrams
  func getBigrams(_ s: String) -> [String] {
    guard s.count > 1 else { return [] }
    var bigrams = [String]()
    let chars = Array(s)
    for i in 0..<(chars.count - 1) {
      bigrams.append(String(chars[i]) + String(chars[i + 1]))
    }
    return bigrams
  }

  let bigrams1 = getBigrams(s1)
  let bigrams2 = getBigrams(s2)

  // Handle edge cases
  if bigrams1.isEmpty && bigrams2.isEmpty {
    return 1.0  // Both strings are empty or length 1, consider them "similar"
  }
  if bigrams1.isEmpty || bigrams2.isEmpty {
    return 0.0  // One string has bigrams, the other doesn't
  }

  // Count unique bigrams in each string
  let set1 = Set(bigrams1)
  let set2 = Set(bigrams2)

  // Calculate intersection size (shared bigrams)
  let intersection = set1.intersection(set2).count

  // Calculate Dice coefficient: 2*|X∩Y|/(|X|+|Y|)
  // This gives a value between 0 and 1 where 1 means identical
  return (2.0 * Double(intersection)) / (Double(set1.count + set2.count))
}
