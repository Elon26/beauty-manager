export const IPHONEOS_DEPLOYMENT_TARGET = '14.0';
export const TARGETED_DEVICE_FAMILY = `"1,2"`;
export const SWIFT_VERSION = '5.0';

export const NSE_PODFILE_SNIPPET = `
target 'CredentialProvider' do
  pod 'KeychainSwift', '~> 20.0'
  use_frameworks! :linkage => podfile_properties['ios.useFrameworks'].to_sym if podfile_properties['ios.useFrameworks']
end`;

export const MAIN_TARGET_PODFILE_SNIPPET = `
  pod 'KeychainSwift', '~> 20.0'
`;

export const NSE_PODFILE_REGEX = /target 'CredentialProvider'/;

export const KEYCHAIN_ACCESS_GROUPS_ID_TEMPLATE_REGEX =
  /{{KEYCHAIN_ACCESS_GROUPS_ID_TEMPLATE_REGEX}}/gm;

export const DEFAULT_BUNDLE_VERSION = '1';
export const DEFAULT_BUNDLE_SHORT_VERSION = '1.0';
export const BUNDLE_SHORT_VERSION_TEMPLATE_REGEX = /{{BUNDLE_SHORT_VERSION}}/gm;
export const BUNDLE_VERSION_TEMPLATE_REGEX = /{{BUNDLE_VERSION}}/gm;

export const NSE_TARGET_NAME = 'CredentialProvider';
export const NSE_SOURCE_FILE = 'CredentialProviderViewController.swift';
export const NSE_EXT_FILES = [
  'CredentialProviderViewController.swift',
  'MainInterface.storyboard',
  'SiteCredential.swift',
  'SiteCredentialCell.swift',
  `${NSE_TARGET_NAME}.entitlements`,
  `${NSE_TARGET_NAME}-Info.plist`,
];
