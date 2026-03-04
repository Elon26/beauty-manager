import Contacts

func getMergedContact(fromIds ids: [String], store: CNContactStore) throws -> CNMutableContact {
  let newContact: CNMutableContact = CNMutableContact()
  var contacts: [CNContact] = []
  for id in ids {
    let contact = try store.unifiedContact(
      withIdentifier: id,
      keysToFetch: CNContactKeySets.withImageData)
    contacts.append(contact)
  }

  newContact.contactType = contacts.first?.contactType ?? .person

  newContact.namePrefix = mergedStringValue(from: contacts, key: \.namePrefix)
  newContact.givenName = mergedStringValue(from: contacts, key: \.givenName)
  newContact.middleName = mergedStringValue(from: contacts, key: \.middleName)
  newContact.familyName = mergedStringValue(from: contacts, key: \.familyName)
  newContact.previousFamilyName = mergedStringValue(from: contacts, key: \.previousFamilyName)
  newContact.nameSuffix = mergedStringValue(from: contacts, key: \.nameSuffix)
  newContact.nickname = mergedStringValue(from: contacts, key: \.nickname)
  newContact.phoneticGivenName = mergedStringValue(from: contacts, key: \.phoneticGivenName)
  newContact.phoneticMiddleName = mergedStringValue(from: contacts, key: \.phoneticMiddleName)
  newContact.phoneticFamilyName = mergedStringValue(from: contacts, key: \.phoneticFamilyName)

  newContact.jobTitle = mergedStringValue(from: contacts, key: \.jobTitle)
  newContact.departmentName = mergedStringValue(from: contacts, key: \.departmentName)
  newContact.organizationName = mergedStringValue(from: contacts, key: \.organizationName)
  newContact.phoneticOrganizationName = mergedStringValue(
    from: contacts, key: \.phoneticOrganizationName)

  newContact.postalAddresses = mergedArrayValue(from: contacts, key: \.postalAddresses) { $0 == $1 }
  newContact.emailAddresses = mergedArrayValue(from: contacts, key: \.emailAddresses) { $0 == $1 }
  newContact.urlAddresses = mergedArrayValue(from: contacts, key: \.urlAddresses) { $0 == $1 }
  newContact.instantMessageAddresses = mergedArrayValue(
    from: contacts, key: \.instantMessageAddresses
  ) { $0 == $1 }

  newContact.phoneNumbers = mergedArrayValue(from: contacts, key: \.phoneNumbers) {
    $0.stringValue.components(separatedBy: CharacterSet.decimalDigits.inverted).joined()
      == $1.stringValue.components(separatedBy: CharacterSet.decimalDigits.inverted).joined()
  }

  newContact.socialProfiles = mergedArrayValue(from: contacts, key: \.socialProfiles) {
    $0.service == $1.service && $0.username == $1.username
  }

  newContact.birthday = contacts.first(where: { $0.birthday != nil })?.birthday
  newContact.nonGregorianBirthday =
    contacts.first(where: { $0.nonGregorianBirthday != nil })?.nonGregorianBirthday
  newContact.dates = mergedArrayValue(from: contacts, key: \.dates) { $0 == $1 }

  newContact.imageData = contacts.first(where: { $0.imageData != nil })?.imageData

  newContact.contactRelations = mergedArrayValue(from: contacts, key: \.contactRelations) {
    $0 == $1
  }
  return newContact
}

func mergedStringValue(from contacts: [CNContact], key: KeyPath<CNContact, String>) -> String {
  return contacts.first(where: { !$0[keyPath: key].isEmpty })?[keyPath: key] ?? ""
}

func mergedArrayValue<T>(
  from contacts: [CNContact],
  key: KeyPath<CNContact, [CNLabeledValue<T>]>,
  isEqual: @escaping (T, T) -> Bool
) -> [CNLabeledValue<T>] {
  var mergedArray: [CNLabeledValue<T>] = []
  for contact in contacts {
    let values = contact[keyPath: key]
    for value in values {
      if !mergedArray.contains(where: { isEqual($0.value, value.value) }) {
        mergedArray.append(value)
      }
    }
  }
  return mergedArray
}
