// Reexport the native module. On web, it will be resolved to ContactsKitModule.web.ts
// and on native platforms to ContactsKitModule.ts
export { default } from './src/ContactsKitModule';
export * from './src/ContactsKit.types';
