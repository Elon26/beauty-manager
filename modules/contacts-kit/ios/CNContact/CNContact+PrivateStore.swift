import Contacts

private let privateContactsDirectory = "PrivateContacts"

extension CNContact {
  private static let storageQueue = DispatchQueue(label: "com.app.privateContactsStorage")

  func asFreshMutableContact() -> CNMutableContact {
    let fresh = CNMutableContact()
    fresh.contactType = self.contactType
    fresh.namePrefix = self.namePrefix
    fresh.givenName = self.givenName
    fresh.middleName = self.middleName
    fresh.familyName = self.familyName
    fresh.previousFamilyName = self.previousFamilyName
    fresh.nameSuffix = self.nameSuffix
    fresh.nickname = self.nickname
    fresh.phoneticGivenName = self.phoneticGivenName
    fresh.phoneticMiddleName = self.phoneticMiddleName
    fresh.phoneticFamilyName = self.phoneticFamilyName
    fresh.jobTitle = self.jobTitle
    fresh.departmentName = self.departmentName
    fresh.organizationName = self.organizationName
    fresh.phoneticOrganizationName = self.phoneticOrganizationName
    fresh.postalAddresses = self.postalAddresses
    fresh.emailAddresses = self.emailAddresses
    fresh.urlAddresses = self.urlAddresses
    fresh.phoneNumbers = self.phoneNumbers
    fresh.socialProfiles = self.socialProfiles
    fresh.dates = self.dates
    fresh.nonGregorianBirthday = self.nonGregorianBirthday
    fresh.birthday = self.birthday
    // fresh.note = self.note
    fresh.imageData = self.imageData
    fresh.contactRelations = self.contactRelations
    fresh.instantMessageAddresses = self.instantMessageAddresses
    return fresh
  }

  func storePrivate(asNew: Bool = true) throws {
    try Self.storageQueue.sync {
      var contact: CNMutableContact
      if asNew {
        contact = self.asFreshMutableContact()
      } else {
        contact = self.mutableCopy() as! CNMutableContact
      }

      let fileManager = FileManager.default
      let documentsDirectory = try fileManager.url(
        for: .documentDirectory, in: .userDomainMask, appropriateFor: nil, create: true)
      let contactsDirectory = documentsDirectory.appendingPathComponent(
        privateContactsDirectory, isDirectory: true)
      try fileManager.createDirectory(at: contactsDirectory, withIntermediateDirectories: true)
      let fileURL = contactsDirectory.appendingPathComponent("\(contact.identifier).contact")

      if fileManager.fileExists(atPath: fileURL.path) {
        try fileManager.removeItem(at: fileURL)
      }

      let data = try NSKeyedArchiver.archivedData(
        withRootObject: contact, requiringSecureCoding: true)
      try data.write(to: fileURL)
    }
  }

  static func getPrivate() throws -> [CNContact] {
    try Self.storageQueue.sync {
      let fileManager = FileManager.default
      let documentsDirectory = try fileManager.url(
        for: .documentDirectory, in: .userDomainMask, appropriateFor: nil, create: true)
      let contactsDirectory = documentsDirectory.appendingPathComponent(
        privateContactsDirectory, isDirectory: true)

      guard fileManager.fileExists(atPath: contactsDirectory.path) else {
        return []
      }

      let fileURLs = try fileManager.contentsOfDirectory(
        at: contactsDirectory, includingPropertiesForKeys: nil)
      var contacts: [CNContact] = []

      for fileURL in fileURLs {
        if let data = try? Data(contentsOf: fileURL),
          let contact = try? NSKeyedUnarchiver.unarchivedObject(ofClass: CNContact.self, from: data)
        {
          contacts.append(contact)
        }
      }

      return contacts
    }
  }

  static func getPrivate(identifier: String) throws -> CNContact? {
    try storageQueue.sync {
      let fileManager = FileManager.default
      let documentsDirectory = try fileManager.url(
        for: .documentDirectory, in: .userDomainMask, appropriateFor: nil, create: true)
      let contactsDirectory = documentsDirectory.appendingPathComponent(
        privateContactsDirectory, isDirectory: true)
      let fileURL = contactsDirectory.appendingPathComponent("\(identifier).contact")

      guard fileManager.fileExists(atPath: fileURL.path) else {
        return nil
      }

      let data = try Data(contentsOf: fileURL)
      return try NSKeyedUnarchiver.unarchivedObject(ofClass: CNContact.self, from: data)
    }
  }

  static func deletePrivate(identifier: String) throws {
    try storageQueue.sync {
      let fileManager = FileManager.default
      let documentsDirectory = try fileManager.url(
        for: .documentDirectory, in: .userDomainMask, appropriateFor: nil, create: true)
      let contactsDirectory = documentsDirectory.appendingPathComponent(
        privateContactsDirectory, isDirectory: true)
      let fileURL = contactsDirectory.appendingPathComponent("\(identifier).contact")

      if fileManager.fileExists(atPath: fileURL.path) {
        try fileManager.removeItem(at: fileURL)
      }
    }
  }

}
