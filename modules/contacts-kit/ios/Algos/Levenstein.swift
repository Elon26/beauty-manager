func levenshteinDistance(from source: String, to target: String) -> Int {
  // Convert strings to arrays for faster indexing
  let sourceChars = Array(source)
  let targetChars = Array(target)

  let sourceCount = sourceChars.count
  let targetCount = targetChars.count

  // Early exits
  if sourceCount == 0 { return targetCount }
  if targetCount == 0 { return sourceCount }

  // Use two rows instead of full matrix to save space
  var v0 = [Int](repeating: 0, count: targetCount + 1)
  var v1 = [Int](repeating: 0, count: targetCount + 1)

  // Initialize first row
  for i in 0...targetCount {
    v0[i] = i
  }

  for i in 0..<sourceCount {
    v1[0] = i + 1

    for j in 0..<targetCount {
      let deletionCost = v0[j + 1] + 1
      let insertionCost = v1[j] + 1
      let substitutionCost = sourceChars[i] == targetChars[j] ? v0[j] : v0[j] + 1

      v1[j + 1] = min(deletionCost, insertionCost, substitutionCost)
    }

    // Swap rows
    (v0, v1) = (v1, v0)
  }

  return v0[targetCount]
}
