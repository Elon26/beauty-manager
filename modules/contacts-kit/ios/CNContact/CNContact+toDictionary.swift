import Contacts

extension CNContact {
  /**
   * Converts a CNContact to a dictionary representation
   * for use with JavaScript/React Native
   */
  func toDictionary() -> [String: Any] {
    var dict: [String: Any] = [:]

    func add(_ key: String, value: String?) {
      if let value = value, !value.isEmpty {
        dict[key] = value
      }
    }

    // Always available
    dict["identifier"] = self.identifier

    // Contact type
    if self.isKeyAvailable(CNContactTypeKey) {
      dict["contactType"] =
        self.contactType.rawValue == CNContactType.person.rawValue ? "person" : "organization"
    }

    // String fields - Name components
    if self.isKeyAvailable(CNContactGivenNameKey) {
      add("givenName", value: self.givenName)
    }
    if self.isKeyAvailable(CNContactMiddleNameKey) {
      add("middleName", value: self.middleName)
    }
    if self.isKeyAvailable(CNContactFamilyNameKey) {
      add("familyName", value: self.familyName)
    }
    if self.isKeyAvailable(CNContactPreviousFamilyNameKey) {
      add("previousFamilyName", value: self.previousFamilyName)
    }
    if self.isKeyAvailable(CNContactNamePrefixKey) {
      add("namePrefix", value: self.namePrefix)
    }
    if self.isKeyAvailable(CNContactNameSuffixKey) {
      add("nameSuffix", value: self.nameSuffix)
    }
    if self.isKeyAvailable(CNContactNicknameKey) {
      add("nickname", value: self.nickname)
    }

    // Phonetic name fields
    if self.isKeyAvailable(CNContactPhoneticGivenNameKey) {
      add("phoneticGivenName", value: self.phoneticGivenName)
    }
    if self.isKeyAvailable(CNContactPhoneticMiddleNameKey) {
      add("phoneticMiddleName", value: self.phoneticMiddleName)
    }
    if self.isKeyAvailable(CNContactPhoneticFamilyNameKey) {
      add("phoneticFamilyName", value: self.phoneticFamilyName)
    }

    // Work information
    if self.isKeyAvailable(CNContactOrganizationNameKey) {
      add("organizationName", value: self.organizationName)
    }
    if self.isKeyAvailable(CNContactPhoneticOrganizationNameKey) {
      add("phoneticOrganizationName", value: self.phoneticOrganizationName)
    }
    if self.isKeyAvailable(CNContactDepartmentNameKey) {
      add("departmentName", value: self.departmentName)
    }
    if self.isKeyAvailable(CNContactJobTitleKey) {
      add("jobTitle", value: self.jobTitle)
    }
    if self.isKeyAvailable(CNContactNoteKey) {
      add("note", value: self.note)
    }

    // Birthday
    if self.isKeyAvailable(CNContactBirthdayKey), let b = self.birthday {
      dict["birthday"] = [
        "year": b.year as Any,
        "month": b.month as Any,
        "day": b.day as Any,
      ]
    }

    // Non-Gregorian birthday
    if self.isKeyAvailable(CNContactNonGregorianBirthdayKey), let b = self.nonGregorianBirthday {
      dict["nonGregorianBirthday"] = [
        "era": b.era as Any,
        "year": b.year as Any,
        "month": b.month as Any,
        "day": b.day as Any,
        "isLeapMonth": b.isLeapMonth as Any,
      ]
    }

    // Phone numbers
    if self.isKeyAvailable(CNContactPhoneNumbersKey) {
      let phones = self.phoneNumbers.map {
        [
          "label": CNLabeledValue<NSString>.localizedString(forLabel: $0.label ?? ""),
          "value": $0.value.stringValue,
        ]
      }
      if !phones.isEmpty { dict["phoneNumbers"] = phones }
    }

    // Email addresses
    if self.isKeyAvailable(CNContactEmailAddressesKey) {
      let emails = self.emailAddresses.map {
        [
          "label": CNLabeledValue<NSString>.localizedString(forLabel: $0.label ?? ""),
          "value": String($0.value),
        ]
      }
      if !emails.isEmpty { dict["emailAddresses"] = emails }
    }

    // Postal addresses
    if self.isKeyAvailable(CNContactPostalAddressesKey) {
      let addresses = self.postalAddresses.map {
        let a = $0.value
        return [
          "label": CNLabeledValue<NSString>.localizedString(forLabel: $0.label ?? ""),
          "value": [
            "street": a.street,
            "city": a.city,
            "state": a.state,
            "postalCode": a.postalCode,
            "country": a.country,
            "isoCountryCode": a.isoCountryCode,
          ],
        ]
      }
      if !addresses.isEmpty { dict["postalAddresses"] = addresses }
    }

    // URL addresses
    if self.isKeyAvailable(CNContactUrlAddressesKey) {
      let urls = self.urlAddresses.map {
        [
          "label": CNLabeledValue<NSString>.localizedString(forLabel: $0.label ?? ""),
          "value": String($0.value),
        ]
      }
      if !urls.isEmpty { dict["urlAddresses"] = urls }
    }

    // Dates
    if self.isKeyAvailable(CNContactDatesKey) {
      let dates = self.dates.map {
        let date = $0.value
        return [
          "label": CNLabeledValue<NSString>.localizedString(forLabel: $0.label ?? ""),
          "value": [
            "year": date.year as Any,
            "month": date.month as Any,
            "day": date.day as Any,
          ],
        ]
      }
      if !dates.isEmpty { dict["dates"] = dates }
    }

    // Relationships
    if self.isKeyAvailable(CNContactRelationsKey) {
      let relations = self.contactRelations.map {
        [
          "label": CNLabeledValue<NSString>.localizedString(forLabel: $0.label ?? ""),
          "value": String($0.value.name),
        ]
      }
      if !relations.isEmpty { dict["relationships"] = relations }
    }

    // Social profiles
    if self.isKeyAvailable(CNContactSocialProfilesKey) {
      let socials = self.socialProfiles.map {
        let s = $0.value
        return [
          "label": CNLabeledValue<NSString>.localizedString(forLabel: $0.label ?? ""),
          "value": [
            "service": s.service,
            "urlString": s.urlString,
            "username": s.username,
            "userIdentifier": s.userIdentifier,
          ],
        ]
      }
      if !socials.isEmpty { dict["socialProfiles"] = socials }
    }

    // Instant message addresses
    if self.isKeyAvailable(CNContactInstantMessageAddressesKey) {
      let ims = self.instantMessageAddresses.map {
        let im = $0.value
        return [
          "label": CNLabeledValue<NSString>.localizedString(forLabel: $0.label ?? ""),
          "value": [
            "service": im.service,
            "username": im.username,
          ],
        ]
      }
      if !ims.isEmpty { dict["instantMessageAddresses"] = ims }
    }

    // Image data
    if self.isKeyAvailable(CNContactImageDataKey), let imageData = self.imageData {
      dict["imageData"] = imageData.base64EncodedString()
    }

    if self.isKeyAvailable(CNContactThumbnailImageDataKey),
      let thumbnailData = self.thumbnailImageData
    {
      dict["thumbnailImageData"] = thumbnailData.base64EncodedString()
    }

    if self.isKeyAvailable(CNContactImageDataAvailableKey) {
      dict["imageDataAvailable"] = self.imageDataAvailable
    }

    return dict
  }
}
