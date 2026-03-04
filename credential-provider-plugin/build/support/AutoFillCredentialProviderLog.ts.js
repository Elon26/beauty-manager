"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AutoFillCredentialProviderLog = void 0;
class AutoFillCredentialProviderLog {
    static log(str) {
        console.log(`\tautoFill-credentialProvider-expo-plugin: ${str}`);
    }
    static error(str) {
        console.error(`\tautoFill-credentialProvider-expo-plugin: ${str}`);
    }
}
exports.AutoFillCredentialProviderLog = AutoFillCredentialProviderLog;
