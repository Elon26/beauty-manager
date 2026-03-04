export class AutoFillCredentialProviderLog {
  static log(str: string) {
    console.log(`\tautoFill-credentialProvider-expo-plugin: ${str}`);
  }

  static error(str: string) {
    console.error(`\tautoFill-credentialProvider-expo-plugin: ${str}`);
  }
}
