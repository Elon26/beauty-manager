import KeychainSwift
import ExpoModulesCore
import AuthenticationServices
import AVFoundation

public class KeychainManagerModule: Module {
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.
  public func definition() -> ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('KeychainManager')` in JavaScript.
    Name("KeychainManager")

    AsyncFunction("getAllKeys") {
       (service: String, promise: Promise) in
       let keychain = KeychainSwift()
       keychain.accessGroup = service
       let keys = keychain.allKeys
       promise.resolve(keys)
    }

    AsyncFunction("isAutoFillEnabled") { (promise: Promise) in 
       let store = ASCredentialIdentityStore.shared
        store.getState { state in
        promise.resolve(state.isEnabled)
      }
    }

    AsyncFunction("removeAllCredentialIdentities") { (promise: Promise) in 
       let store = ASCredentialIdentityStore.shared
       store.getState { state in
       if (state.isEnabled) {
        store.removeAllCredentialIdentities { (result: Bool, err: Error?) in
          if (err != nil) {
            print("Error: \(err)")
            return
          }
          promise.resolve(true)
        }
      } else {
        promise.resolve(false)
       }
      }
    }

     AsyncFunction("removeCredentialIdentities") { ( identifier: String, user: String, recordIdentifier: String, promise: Promise) in 
       let store = ASCredentialIdentityStore.shared
       store.getState { state in
      if (state.isEnabled) {
        let type = (identifier.contains("http://") || identifier.contains("https://"))
          ? ASCredentialServiceIdentifier.IdentifierType.URL
          : ASCredentialServiceIdentifier.IdentifierType.domain
        
        let credential = ASPasswordCredentialIdentity(
          serviceIdentifier: ASCredentialServiceIdentifier(identifier: identifier, type: type),
          user: user,
          recordIdentifier: recordIdentifier
        )

        store.removeCredentialIdentities([credential]){ (result: Bool, err: Error?) in
          if (err != nil) {
            print("Error: \(err)")
            return
          }
          
          promise.resolve(true)
        }
      } else {
        promise.resolve(false)
      }
     }
    }
    

    AsyncFunction("saveCredentialIdentities") { ( identifier: String, user: String, recordIdentifier: String, promise: Promise) in
        let store = ASCredentialIdentityStore.shared
        store.getState { state in
        if (state.isEnabled) {
        let type = (identifier.contains("http://") || identifier.contains("https://"))
          ? ASCredentialServiceIdentifier.IdentifierType.URL
          : ASCredentialServiceIdentifier.IdentifierType.domain
        
        let credential = ASPasswordCredentialIdentity(
          serviceIdentifier: ASCredentialServiceIdentifier(identifier: identifier, type: type),
          user: user,
          recordIdentifier: recordIdentifier
        )

        store.removeCredentialIdentities([credential]){ (result: Bool, err: Error?) in
          if (err != nil) {
            print("Error: \(err)")
            return
          }
         promise.resolve(true)
        }
      } else {
        promise.resolve(false)
      }
    }
   }
  }
}