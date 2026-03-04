import fs from 'fs';

import { AutoFillCredentialProviderLog } from './AutoFillCredentialProviderLog.ts';
import { FileManager } from './FileManager';
import {
  NSE_PODFILE_REGEX,
  MAIN_TARGET_PODFILE_SNIPPET,
  NSE_PODFILE_SNIPPET,
} from './iosConstants';

export async function updatePodfile(
  iosPath: string,
  targetNameMainProject: string,
) {
  const podfile = await FileManager.readFile(`${iosPath}/Podfile`);
  const matches = podfile.match(NSE_PODFILE_REGEX);
  const matchesMainSnippet = podfile.match(NSE_PODFILE_REGEX);
  const array = podfile.toString().split('\n');
  const resultFile: string[] = [];

  for (let i = 0; i < array.length; i++) {
    if (array[i] === `target '${targetNameMainProject}' do`) {
      resultFile.push(array[i]);
      if (matchesMainSnippet) {
        AutoFillCredentialProviderLog.log(
          'CredentialProvider target already added to Podfile. Skipping...',
        );
      } else {
        resultFile.push(MAIN_TARGET_PODFILE_SNIPPET);
      }
    } else {
      resultFile.push(array[i]);
    }
  }

  if (matches) {
    AutoFillCredentialProviderLog.log(
      'CredentialProvider target already added to Podfile. Skipping...',
    );
  } else {
    resultFile.push(NSE_PODFILE_SNIPPET);
  }

  const text = resultFile.join('\n');

  fs.writeFile(`${iosPath}/Podfile`, text, function (err) {
    if (err) return AutoFillCredentialProviderLog.log(err.message);
  });
}
