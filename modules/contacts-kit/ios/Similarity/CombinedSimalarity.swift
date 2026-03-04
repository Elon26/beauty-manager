import Contacts

func groupBySimilarNamesOrPhones(
  _ contacts: [CNContact],
  withSimilarityThreshold threshold: Double = 0.8,
  algo: Algo = .jaroWinkler,
  withPhoneSuffixLength suffixLength: Int
) -> [[CNContact]] {
  let unionFind = UnionFind()
  var contactsLookup: [String: CNContact] = [:]
  var phoneSuffixMap: [String: [String]] = [:]

  for contact in contacts {
    contactsLookup[contact.identifier] = contact
    unionFind.makeSet(x: contact.identifier)

    for phone in contact.phoneNumbers {
      let normalized = normalizePhoneNumber(phone.value.stringValue, suffixLength: suffixLength)
      guard !normalized.isEmpty else { continue }

      if phoneSuffixMap[normalized] == nil {
        phoneSuffixMap[normalized] = [contact.identifier]
      } else {
        phoneSuffixMap[normalized]?.append(contact.identifier)
      }
    }
  }

  for (_, contactIds) in phoneSuffixMap {
    if contactIds.count > 1 {
      let firstId = contactIds[0]
      for i in 1..<contactIds.count {
        unionFind.union(x: firstId, y: contactIds[i])
      }
    }
  }

  var currentGroups: [String: [CNContact]] = [:]
  for contact in contacts {
    let root = unionFind.find(x: contact.identifier)
    if currentGroups[root] == nil {
      currentGroups[root] = []
    }
    currentGroups[root]?.append(contact)
  }

  var singleContactGroups = currentGroups.values.filter { $0.count == 1 }.flatMap { $0 }

  var i = 0
  while i < singleContactGroups.count {
    let contact1 = singleContactGroups[i]
    let name1 = getNormalizedName(for: contact1)

    if name1.isEmpty {
      i += 1
      continue
    }

    var j = i + 1
    while j < singleContactGroups.count {
      let contact2 = singleContactGroups[j]
      let name2 = getNormalizedName(for: contact2)

      if name2.isEmpty {
        j += 1
        continue
      }

      if isSimilarNames(name1, name2, algo: algo, threshold: threshold) {
        unionFind.union(x: contact1.identifier, y: contact2.identifier)
        singleContactGroups.remove(at: j)
      } else {
        j += 1
      }
    }

    i += 1
  }

  var finalGroups: [String: [String]] = [:]
  for contact in contacts {
    let root = unionFind.find(x: contact.identifier)
    if finalGroups[root] == nil {
      finalGroups[root] = []
    }
    finalGroups[root]?.append(contact.identifier)
  }

  return finalGroups.values.filter { $0.count > 1 }.map { group in
    group.compactMap { contactsLookup[$0] }
  }
}
