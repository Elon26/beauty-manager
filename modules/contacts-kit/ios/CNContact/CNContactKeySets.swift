import Contacts

enum CNContactKeySets {
  static let withoutImageData: [CNKeyDescriptor] =
    [
      CNContactIdentifierKey,
      CNContactTypeKey,
      CNContactPropertyAttribute,

      CNContactNamePrefixKey,
      CNContactGivenNameKey,
      CNContactMiddleNameKey,
      CNContactFamilyNameKey,
      CNContactPreviousFamilyNameKey,
      CNContactNameSuffixKey,
      CNContactNicknameKey,
      CNContactPhoneticGivenNameKey,
      CNContactPhoneticMiddleNameKey,
      CNContactPhoneticFamilyNameKey,

      CNContactJobTitleKey,
      CNContactDepartmentNameKey,
      CNContactOrganizationNameKey,
      CNContactPhoneticOrganizationNameKey,

      CNContactPostalAddressesKey,
      CNContactEmailAddressesKey,
      CNContactUrlAddressesKey,
      CNContactInstantMessageAddressesKey,

      CNContactPhoneNumbersKey,

      CNContactSocialProfilesKey,

      CNContactBirthdayKey,
      CNContactNonGregorianBirthdayKey,
      CNContactDatesKey,

      // CNContactNoteKey,

      // CNContactImageDataKey,
      // CNContactThumbnailImageDataKey,
      CNContactImageDataAvailableKey,

      CNContactRelationsKey,

      CNGroupNameKey,
      CNGroupIdentifierKey,
      CNContainerNameKey,
      CNContainerTypeKey,

      CNInstantMessageAddressServiceKey,
      CNInstantMessageAddressUsernameKey,

      CNSocialProfileServiceKey,
      CNSocialProfileURLStringKey,
      CNSocialProfileUsernameKey,
      CNSocialProfileUserIdentifierKey,
    ] as [CNKeyDescriptor]

  static let withImageData: [CNKeyDescriptor] =
    [
      CNContactIdentifierKey,
      CNContactTypeKey,
      CNContactPropertyAttribute,

      CNContactNamePrefixKey,
      CNContactGivenNameKey,
      CNContactMiddleNameKey,
      CNContactFamilyNameKey,
      CNContactPreviousFamilyNameKey,
      CNContactNameSuffixKey,
      CNContactNicknameKey,
      CNContactPhoneticGivenNameKey,
      CNContactPhoneticMiddleNameKey,
      CNContactPhoneticFamilyNameKey,

      CNContactJobTitleKey,
      CNContactDepartmentNameKey,
      CNContactOrganizationNameKey,
      CNContactPhoneticOrganizationNameKey,

      CNContactPostalAddressesKey,
      CNContactEmailAddressesKey,
      CNContactUrlAddressesKey,
      CNContactInstantMessageAddressesKey,

      CNContactPhoneNumbersKey,

      CNContactSocialProfilesKey,

      CNContactBirthdayKey,
      CNContactNonGregorianBirthdayKey,
      CNContactDatesKey,

      // CNContactNoteKey,

      CNContactImageDataKey,
      CNContactThumbnailImageDataKey,
      CNContactImageDataAvailableKey,

      CNContactRelationsKey,

      CNGroupNameKey,
      CNGroupIdentifierKey,
      CNContainerNameKey,
      CNContainerTypeKey,

      CNInstantMessageAddressServiceKey,
      CNInstantMessageAddressUsernameKey,

      CNSocialProfileServiceKey,
      CNSocialProfileURLStringKey,
      CNSocialProfileUsernameKey,
      CNSocialProfileUserIdentifierKey,

    ] as [CNKeyDescriptor]

  static let imageDataOnly: [CNKeyDescriptor] =
    [
      CNContactIdentifierKey,
      CNContactImageDataKey,
      CNContactThumbnailImageDataKey,
      CNContactImageDataAvailableKey,
    ] as [CNKeyDescriptor]

  static let identifierOnly: [CNKeyDescriptor] =
    [
      CNContactIdentifierKey
    ] as [CNKeyDescriptor]
}

enum CNContactKeyPredicate {
  @available(iOS 16, *)
  static let incompleteContacts = NSPredicate(
    format: "(firstName == '' AND lastName == '') OR phoneNumbers.@count == 0"
  )
}
