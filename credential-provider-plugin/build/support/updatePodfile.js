"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePodfile = updatePodfile;
const fs_1 = __importDefault(require("fs"));
const AutoFillCredentialProviderLog_ts_1 = require("./AutoFillCredentialProviderLog.ts");
const FileManager_1 = require("./FileManager");
const iosConstants_1 = require("./iosConstants");
async function updatePodfile(iosPath, targetNameMainProject) {
    const podfile = await FileManager_1.FileManager.readFile(`${iosPath}/Podfile`);
    const matches = podfile.match(iosConstants_1.NSE_PODFILE_REGEX);
    const matchesMainSnippet = podfile.match(iosConstants_1.NSE_PODFILE_REGEX);
    const array = podfile.toString().split('\n');
    const resultFile = [];
    for (let i = 0; i < array.length; i++) {
        if (array[i] === `target '${targetNameMainProject}' do`) {
            resultFile.push(array[i]);
            if (matchesMainSnippet) {
                AutoFillCredentialProviderLog_ts_1.AutoFillCredentialProviderLog.log('CredentialProvider target already added to Podfile. Skipping...');
            }
            else {
                resultFile.push(iosConstants_1.MAIN_TARGET_PODFILE_SNIPPET);
            }
        }
        else {
            resultFile.push(array[i]);
        }
    }
    if (matches) {
        AutoFillCredentialProviderLog_ts_1.AutoFillCredentialProviderLog.log('CredentialProvider target already added to Podfile. Skipping...');
    }
    else {
        resultFile.push(iosConstants_1.NSE_PODFILE_SNIPPET);
    }
    const text = resultFile.join('\n');
    fs_1.default.writeFile(`${iosPath}/Podfile`, text, function (err) {
        if (err)
            return AutoFillCredentialProviderLog_ts_1.AutoFillCredentialProviderLog.log(err.message);
    });
}
