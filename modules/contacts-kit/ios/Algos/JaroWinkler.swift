func jaroWinklerSimilarity(_ s1: String, _ s2: String) -> Double {
  // Convert to character arrays for faster access
  let chars1 = Array(s1.lowercased())
  let chars2 = Array(s2.lowercased())

  // Empty string handling
  let len1 = chars1.count
  let len2 = chars2.count
  if len1 == 0 || len2 == 0 {
    return 0.0
  }

  // Calculate match window (half the length of the longer string, minimum 1)
  let matchDistance = max(max(len1, len2) / 2 - 1, 0)

  // Track which characters have been matched
  var matches1 = [Bool](repeating: false, count: len1)
  var matches2 = [Bool](repeating: false, count: len2)

  // Count matching characters
  var matchingChars = 0
  for i in 0..<len1 {
    // Calculate window boundaries
    let start = max(0, i - matchDistance)
    let end = min(len2 - 1, i + matchDistance)

    // Check that the range is valid before iterating
    if start <= end {  // Add this check
      for j in start...end {
        // Skip if already matched or characters don't match
        if matches2[j] || chars1[i] != chars2[j] {
          continue
        }

        // Mark as matched
        matches1[i] = true
        matches2[j] = true
        matchingChars += 1
        break
      }
    }
  }

  // Return early if no matching characters
  if matchingChars == 0 {
    return 0.0
  }

  // Count transpositions
  var transpositions = 0
  var j = 0
  for i in 0..<len1 {
    if !matches1[i] {
      continue
    }

    // Find the next matched character in s2
    while !matches2[j] {
      j += 1
    }

    // If the characters don't match, it's a transposition
    if chars1[i] != chars2[j] {
      transpositions += 1
    }

    j += 1
  }

  // Calculate Jaro similarity
  let halfTranspositions = transpositions / 2
  let jaroSimilarity =
    (Double(matchingChars) / Double(len1) + Double(matchingChars) / Double(len2) + Double(
      matchingChars - halfTranspositions) / Double(matchingChars)) / 3.0

  // Calculate Winkler improvement
  // Gives more weight to matching prefixes
  let prefixLength = min(4, min(len1, len2))
  var commonPrefix = 0
  for i in 0..<prefixLength {
    if i < len1 && i < len2 && chars1[i] == chars2[i] {
      commonPrefix += 1
    } else {
      break
    }
  }

  // Scaling factor for how much to adjust score based on prefix matches
  let prefixScalingFactor = 0.1

  // Winkler modification: add prefix bonus
  return jaroSimilarity + (Double(commonPrefix) * prefixScalingFactor * (1.0 - jaroSimilarity))
}
