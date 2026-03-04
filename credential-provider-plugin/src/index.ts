import { ConfigPlugin } from '@expo/config-plugins';

import { validatePluginProps } from './support/helpers';
import { AutoFillCredentialProviderPluginProps } from './types';
import { withAutoFillCredentialProviderIos } from './withAutoFillCredentialProviderIos';

const withAutoFillCredentialProvider: ConfigPlugin<
  AutoFillCredentialProviderPluginProps
> = (config, props) => {
  // if props are undefined, throw error
  if (!props) {
    throw new Error(
      'You are trying to use the utoFillCredentialProvider plugin without any props.',
    );
  }

  validatePluginProps(props);

  config = withAutoFillCredentialProviderIos(config, props);

  return config;
};

export default withAutoFillCredentialProvider;
