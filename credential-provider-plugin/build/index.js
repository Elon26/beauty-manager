"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("./support/helpers");
const withAutoFillCredentialProviderIos_1 = require("./withAutoFillCredentialProviderIos");
const withAutoFillCredentialProvider = (config, props) => {
    // if props are undefined, throw error
    if (!props) {
        throw new Error('You are trying to use the utoFillCredentialProvider plugin without any props.');
    }
    (0, helpers_1.validatePluginProps)(props);
    config = (0, withAutoFillCredentialProviderIos_1.withAutoFillCredentialProviderIos)(config, props);
    return config;
};
exports.default = withAutoFillCredentialProvider;
