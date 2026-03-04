"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePluginProps = validatePluginProps;
const types_1 = require("../types");
function validatePluginProps(props) {
    // check the type of each property
    if (props.devTeam && typeof props.devTeam !== 'string') {
        throw new Error("AutoFillCredentialProvider Expo Plugin: 'devTeam' must be a string.");
    }
    // check for extra properties
    const inputProps = Object.keys(props);
    for (const prop of inputProps) {
        if (!types_1.AUTOFILL_CREDENTIAL_PLUGIN_PROPS.includes(prop)) {
            throw new Error(`AutoFillCredentialProvider Expo Plugin: You have provided an invalid property "${prop}" to the AutoFillCredentialProvider plugin.`);
        }
    }
}
