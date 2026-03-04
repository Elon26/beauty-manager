import Contacts

func normalizePhoneNumber(_ number: String, suffixLength: Int) -> String {
  let digits = number.components(separatedBy: CharacterSet.decimalDigits.inverted).joined()
  return String(digits.suffix(suffixLength))
}

func groupBySimilarPhoneNumbers(_ contacts: [CNContact], withSuffixLength suffixLength: Int)
  -> [[CNContact]]
{
  let unionFind = UnionFind()
  var phoneSuffixMap: [String: [String]] = [:]
  var contactsLookup: [String: CNContact] = [:]

  for contact in contacts {
    guard contact.isKeyAvailable(CNContactPhoneNumbersKey) else { continue }
    contactsLookup[contact.identifier] = contact
    unionFind.makeSet(x: contact.identifier)
    for phone in contact.phoneNumbers {
      let normalized = normalizePhoneNumber(phone.value.stringValue, suffixLength: suffixLength)
      guard !normalized.isEmpty else { continue }
      if phoneSuffixMap[normalized] != nil {
        phoneSuffixMap[normalized]?.append(contact.identifier)
      } else {
        phoneSuffixMap[normalized] = [contact.identifier]
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

  var groups: [String: [String]] = [:]
  for contact in contacts {
    let root = unionFind.find(x: contact.identifier)
    if groups[root] == nil {
      groups[root] = []
    }
    groups[root]?.append(contact.identifier)
  }
  return groups.values.filter { $0.count > 1 }.map { group in
    group.compactMap { id in
      contactsLookup[id]
    }
  }
}
