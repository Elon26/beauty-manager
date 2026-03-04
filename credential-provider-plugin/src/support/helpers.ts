import { AUTOFILL_CREDENTIAL_PLUGIN_PROPS } from '../types';

export function validatePluginProps(props: any): void {
  // check the type of each property
  if (props.devTeam && typeof props.devTeam !== 'string') {
    throw new Error(
      "AutoFillCredentialProvider Expo Plugin: 'devTeam' must be a string.",
    );
  }

  // check for extra properties
  const inputProps = Object.keys(props);

  for (const prop of inputProps) {
    if (!AUTOFILL_CREDENTIAL_PLUGIN_PROPS.includes(prop)) {
      throw new Error(
        `AutoFillCredentialProvider Expo Plugin: You have provided an invalid property "${prop}" to the AutoFillCredentialProvider plugin.`,
      );
    }
  }
}
