"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NSE_EXT_FILES = exports.NSE_SOURCE_FILE = exports.NSE_TARGET_NAME = exports.BUNDLE_VERSION_TEMPLATE_REGEX = exports.BUNDLE_SHORT_VERSION_TEMPLATE_REGEX = exports.DEFAULT_BUNDLE_SHORT_VERSION = exports.DEFAULT_BUNDLE_VERSION = exports.KEYCHAIN_ACCESS_GROUPS_ID_TEMPLATE_REGEX = exports.NSE_PODFILE_REGEX = exports.MAIN_TARGET_PODFILE_SNIPPET = exports.NSE_PODFILE_SNIPPET = exports.SWIFT_VERSION = exports.TARGETED_DEVICE_FAMILY = exports.IPHONEOS_DEPLOYMENT_TARGET = void 0;
exports.IPHONEOS_DEPLOYMENT_TARGET = '14.0';
exports.TARGETED_DEVICE_FAMILY = `"1,2"`;
exports.SWIFT_VERSION = '5.0';
exports.NSE_PODFILE_SNIPPET = `
target 'CredentialProvider' do
  pod 'KeychainSwift', '~> 20.0'
  use_frameworks! :linkage => podfile_properties['ios.useFrameworks'].to_sym if podfile_properties['ios.useFrameworks']
end`;
exports.MAIN_TARGET_PODFILE_SNIPPET = `
  pod 'KeychainSwift', '~> 20.0'
`;
exports.NSE_PODFILE_REGEX = /target 'CredentialProvider'/;
exports.KEYCHAIN_ACCESS_GROUPS_ID_TEMPLATE_REGEX = /{{KEYCHAIN_ACCESS_GROUPS_ID_TEMPLATE_REGEX}}/gm;
exports.DEFAULT_BUNDLE_VERSION = '1';
exports.DEFAULT_BUNDLE_SHORT_VERSION = '1.0';
exports.BUNDLE_SHORT_VERSION_TEMPLATE_REGEX = /{{BUNDLE_SHORT_VERSION}}/gm;
exports.BUNDLE_VERSION_TEMPLATE_REGEX = /{{BUNDLE_VERSION}}/gm;
exports.NSE_TARGET_NAME = 'CredentialProvider';
exports.NSE_SOURCE_FILE = 'CredentialProviderViewController.swift';
exports.NSE_EXT_FILES = [
    'CredentialProviderViewController.swift',
    'MainInterface.storyboard',
    'SiteCredential.swift',
    'SiteCredentialCell.swift',
    `${exports.NSE_TARGET_NAME}.entitlements`,
    `${exports.NSE_TARGET_NAME}-Info.plist`,
];
