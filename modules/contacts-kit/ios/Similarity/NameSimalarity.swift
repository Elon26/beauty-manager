import Contacts

func getNormalizedName(for contact: CNContact) -> String {
  let fullName =
    [contact.familyName, contact.givenName]
    .filter { !$0.isEmpty }
    .joined()
    .localizedLowercase
    .replacingOccurrences(of: " ", with: "")
  return fullName.trimmingCharacters(in: .whitespacesAndNewlines)
}

enum Algo {
  case jaroWinkler
  case levenshtein
  case bigram
  case hybrid

  static func fromString(_ algo: String) -> Algo {
    switch algo {
    case "jaroWinkler":
      return .jaroWinkler
    case "levenshtein":
      return .levenshtein
    case "bigram":
      return .bigram
    case "hybrid":
      return .hybrid
    default:
      return .hybrid
    }
  }
}

func isSimilarNames(_ name1: String, _ name2: String, algo: Algo, threshold: Double) -> Bool {
  if name1.isEmpty || name2.isEmpty { return false }

  switch algo {
  case .jaroWinkler:
    return jaroWinklerSimilarity(name1, name2) >= threshold
  case .levenshtein:
    let distance = levenshteinDistance(from: name1, to: name2)
    let maxLength = Double(max(name1.count, name2.count))
    let similarity = 1.0 - Double(distance) / maxLength
    return similarity >= threshold
  case .bigram:
    return bigramSimilarity(name1, name2) >= threshold
  case .hybrid:
    let bigramScore = bigramSimilarity(name1, name2)
    if bigramScore < 0.5 {  // If bigram similarity is low, skip further checks
      return false
    }
    return jaroWinklerSimilarity(name1, name2) >= threshold
  }

}

func groupBySimilarNames(
  _ contacts: [CNContact], withSimilarityThreshold threshold: Double = 0.8,
  algo: Algo = .jaroWinkler
) -> [[CNContact]] {
  let unionFind = UnionFind()
  var contactsLookup: [String: CNContact] = [:]

  for contact in contacts {
    contactsLookup[contact.identifier] = contact
    unionFind.makeSet(x: contact.identifier)
  }

  var contactsMutable = contacts

  while !contactsMutable.isEmpty {
    let contact1 = contactsMutable.removeFirst()

    let name1 = getNormalizedName(for: contact1)

    if name1.isEmpty { continue }

    var i = 0

    while i < contactsMutable.count {
      let contact2 = contactsMutable[i]

      let name2 = getNormalizedName(for: contact2)

      if name2.isEmpty {
        contactsMutable.remove(at: i)
        continue
      }

      let isSimilar = isSimilarNames(
        name1, name2, algo: algo, threshold: threshold)

      if isSimilar {
        unionFind.union(x: contact1.identifier, y: contact2.identifier)
        contactsMutable.remove(at: i)
      } else {
        i += 1
      }
    }
  }

  var groups: [String: [String]] = [:]
  for contact in contacts {
    let root = unionFind.find(x: contact.identifier)
    if groups[root] == nil {
      groups[root] = []
    }
    groups[root]?.append(contact.identifier)
  }

  return groups.values.filter { $0.count > 1 }.map { group in
    group.compactMap { contactsLookup[$0] }
  }
}
