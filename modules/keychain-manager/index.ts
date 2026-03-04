import KeychainManagerModule from './src/KeychainManagerModule';

async function isAutoFillEnabled() {
  return await KeychainManagerModule.isAutoFillEnabled();
}

async function getAllKeys(service: string) {
  return await KeychainManagerModule.getAllKeys(service);
}

async function removeAllCredentialIdentities() {
  return await KeychainManagerModule.removeAllCredentialIdentities();
}

async function removeCredentialIdentities(
  identifier: string,
  user: string,
  recordIdentifier: string
) {
  return await KeychainManagerModule.removeCredentialIdentities(
    identifier,
    user,
    recordIdentifier
  );
}

async function saveCredentialIdentities(
  identifier: string,
  user: string,
  recordIdentifier: string
) {
  return await KeychainManagerModule.saveCredentialIdentities(
    identifier,
    user,
    recordIdentifier
  );
}

export {
  getAllKeys,
  isAutoFillEnabled,
  removeAllCredentialIdentities,
  removeCredentialIdentities,
  saveCredentialIdentities,
};
