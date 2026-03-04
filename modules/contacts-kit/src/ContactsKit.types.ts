export type OnLoadEventPayload = {
  url: string;
};

export type ContactsKitModuleEvents = {
  onContactsChange: (params: ChangeEventPayload) => void;
  onPrivateChange: (params: ChangeEventPayload) => void;
};

export type ChangeEventPayload = null;

/**
 * Full contact object representing all available contact fields
 */
export type CNContact = {
  /** The contact's unique identifier */
  identifier: string;
  /** The type of contact */
  contactType?: 'person' | 'organization';
  /** Contact's name property attribute */
  nameProperty?: string;

  // Name components
  /** The prefix for the contact's name (e.g., Mr., Dr.) */
  namePrefix?: string;
  /** The contact's given (first) name */
  givenName?: string;
  /** The contact's middle name */
  middleName?: string;
  /** The contact's family (last) name */
  familyName?: string;
  /** The contact's previous family name */
  previousFamilyName?: string;
  /** The contact's name suffix (e.g., Jr., Sr.) */
  nameSuffix?: string;
  /** The contact's nickname */
  nickname?: string;
  /** The phonetic spelling of the contact's given name */
  phoneticGivenName?: string;
  /** The phonetic spelling of the contact's middle name */
  phoneticMiddleName?: string;
  /** The phonetic spelling of the contact's family name */
  phoneticFamilyName?: string;

  // Work information
  /** The name of the organization the contact belongs to */
  organizationName?: string;
  /** The phonetic spelling of the contact's organization name */
  phoneticOrganizationName?: string;
  /** The name of the department the contact belongs to */
  departmentName?: string;
  /** The contact's job title */
  jobTitle?: string;

  // Dates
  /** The birthday of the contact */
  birthday?: CNPartialDate;
  /** The non-Gregorian birthday of the contact (e.g., lunar calendar date) */
  nonGregorianBirthday?: CNNonGregorianDate;
  /** Other dates associated with the contact */
  dates?: CNLabeledValue<CNPartialDate>[];

  // Contact info
  /** The contact's phone numbers */
  phoneNumbers?: CNLabeledValue<string>[];
  /** The contact's email addresses */
  emailAddresses?: CNLabeledValue<string>[];
  /** The contact's postal addresses */
  postalAddresses?: CNLabeledValue<CNPostalAddress>[];
  /** The contact's URL addresses (e.g., websites, profiles) */
  urlAddresses?: CNLabeledValue<string>[];
  /** The contact's instant messaging addresses */
  instantMessageAddresses?: CNLabeledValue<CNInstantMessageAddress>[];
  /** The contact's social media profiles */
  socialProfiles?: CNLabeledValue<CNSocialProfile>[];

  // Relationships
  /** The relationships of the contact (e.g., spouse, child) */
  relationships?: CNLabeledValue<string>[];

  // Images
  // /** Base64-encoded full-size image data for the contact */
  // imageData?: string;
  // /** Base64-encoded thumbnail image data for the contact */
  // thumbnailImageData?: string;
  /** Indicates whether image data is available for the contact */
  imageDataAvailable?: boolean;

  // Notes
  /** Notes associated with the contact */
  note?: string;
};

export type CNContactWithImageData = CNContact & {
  /** Base64-encoded full-size image data for the contact */
  imageData?: string;
  /** Base64-encoded thumbnail image data for the contact */
  thumbnailImageData?: string;
};

// Basic date structure (used for birthday, dates)
export type CNPartialDate = {
  year?: number;
  month?: number;
  day?: number;
};

// Reusable labeled value (used everywhere in CNContact)
export type CNLabeledValue<T> = {
  label?: string;
  value: T;
};

// Postal address type
export type CNPostalAddress = {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isoCountryCode?: string;
};

// Non-Gregorian birthday
export type CNNonGregorianDate = {
  era?: number;
  year?: number;
  month?: number;
  day?: number;
  isLeapMonth?: boolean;
};

// Social profile type
export type CNSocialProfile = {
  service?: string; // e.g., "Twitter", "Facebook"
  urlString?: string;
  username?: string;
  userIdentifier?: string;
};

// Instant messaging address
export type CNInstantMessageAddress = {
  service?: string; // e.g., "Skype", "WhatsApp"
  username?: string;
};
