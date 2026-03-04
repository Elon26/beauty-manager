import Contacts
import ContactsUI
import ExpoModulesCore

public class ContactsKitModule: Module {
  private let store = CNContactStore()
  private var task: Task<Void, Never>?
  private var contactPickerDelegate: ContactsPickerDelegate?
  private var contactViewerDelegate: ContactViewerDelegate?
  private var contactViewController: CNContactViewController?
  private var loadingView: UIView?

  public func definition() -> ModuleDefinition {
    Name("ContactsKit")
    Events("onContactsChange", "onPrivateChange")

    OnStartObserving {
      task?.cancel()
      task = Task { [weak self] in
        for await _ in NotificationCenter.default.notifications(named: .CNContactStoreDidChange) {
          guard let self else { return }
          self.sendEvent("onContactsChange")
        }
      }
    }

    OnStopObserving {
      task?.cancel()
      task = nil
    }

    AsyncFunction("fetchContacts") { (promise: Promise) in
      store.requestAccess(for: .contacts) { [weak self] granted, error in
        guard let self else { return }
        if granted {
          do {
            let contacts = try fetchContacts(
              from: self.store, keysToFetch: CNContactKeySets.withoutImageData)
            promise.resolve(
              contacts.map { contact in
                contact.toDictionary()
              })
          } catch {
            if let exception = error as? Exception {
              promise.reject(exception)
            } else {
              promise.reject(Exception())
            }
          }
        } else {
          if let exception = error as? Exception {
            promise.reject(exception)
          } else {
            promise.reject(Exception())
          }
        }
      }
    }

    AsyncFunction("fetchIncompleteContacts") { (promise: Promise) in
      store.requestAccess(for: .contacts) { [weak self] granted, error in
        guard let self else { return }

        if granted {
          do {
            var contacts: [CNContact]
            let keys: [CNKeyDescriptor] = Array(CNContactKeySets.withoutImageData)

            if #available(iOS 16, *) {
              contacts = try fetchContacts(
                from: self.store,
                keysToFetch: keys,
                predicate: CNContactKeyPredicate.incompleteContacts
              )
            } else {
              contacts = try fetchContacts(
                from: self.store,
                keysToFetch: keys
              )
              contacts = contacts.filter { contact in
                let hasNoPhoneNumbers = contact.phoneNumbers.isEmpty
                let hasNoName = contact.givenName.isEmpty && contact.familyName.isEmpty
                return hasNoPhoneNumbers || hasNoName
              }
            }

            promise.resolve(contacts.map { $0.toDictionary() })
          } catch {
            if let exception = error as? Exception {
              promise.reject(exception)
            } else {
              promise.reject(Exception())
            }
          }
        } else {
          if let exception = error as? Exception {
            promise.reject(exception)
          } else {
            promise.reject(Exception())
          }
        }
      }
    }

    AsyncFunction("getSimilarByPhoneNumber") { (suffixLength: Int, promise: Promise) in
      store.requestAccess(for: .contacts) { [weak self] granted, error in
        guard let self else { return }
        if granted {
          do {
            let contacts = try fetchContacts(
              from: self.store, keysToFetch: CNContactKeySets.withoutImageData)
            let groupedContacts = groupBySimilarPhoneNumbers(
              contacts, withSuffixLength: suffixLength)
            promise.resolve(
              groupedContacts.map { group in
                group.map { contact in
                  contact.toDictionary()
                }
              })
          } catch {
            promise.reject(Exception(name: "FetchError", description: error.localizedDescription))
          }
        } else {
          promise.reject(
            Exception(name: "PermissionDenied", description: "Contact permission not granted"))
        }
      }
    }.runOnQueue(.global(qos: .utility))

    AsyncFunction("getSimilarByName") { (threshold: Double, algo: String, promise: Promise) in
      store.requestAccess(for: .contacts) { [weak self] granted, error in
        guard let self else { return }
        if granted {
          do {
            let contacts = try fetchContacts(
              from: self.store, keysToFetch: CNContactKeySets.withoutImageData)

            let algoEnum = Algo.fromString(algo)

            let groupedContacts = groupBySimilarNames(
              contacts, withSimilarityThreshold: threshold, algo: algoEnum)

            let result = groupedContacts.map { group in
              group.map { $0.toDictionary() }
            }

            promise.resolve(result)
          } catch {
            promise.reject(Exception(name: "FetchError", description: error.localizedDescription))
          }
        } else {
          promise.reject(
            Exception(name: "PermissionDenied", description: "Contact permission not granted"))
        }
      }
    }.runOnQueue(.global(qos: .utility))

    AsyncFunction("getSimilarByNameOrPhone") {
      (threshold: Double, algo: String, suffixLength: Int, promise: Promise) in

      store.requestAccess(for: .contacts) { [weak self] granted, error in
        guard let self else { return }
        if granted {
          do {
            let contacts = try fetchContacts(
              from: self.store, keysToFetch: CNContactKeySets.withoutImageData)

            let algoEnum = Algo.fromString(algo)

            let groupedContacts = groupBySimilarNamesOrPhones(
              contacts, withSimilarityThreshold: threshold, algo: algoEnum,
              withPhoneSuffixLength: suffixLength)

            let result = groupedContacts.map { group in
              group.map { $0.toDictionary() }
            }

            promise.resolve(result)
          } catch {
            promise.reject(Exception(name: "FetchError", description: error.localizedDescription))
          }
        } else {
          promise.reject(
            Exception(name: "PermissionDenied", description: "Contact permission not granted"))
        }
      }
    }.runOnQueue(.global(qos: .utility))

    AsyncFunction("getContactImage") { (contactId: String, promise: Promise) in
      store.requestAccess(for: .contacts) { [weak self] granted, error in
        guard let self else { return }
        if granted {
          do {
            let contact = try self.store.unifiedContact(
              withIdentifier: contactId,
              keysToFetch: CNContactKeySets.imageDataOnly)
            guard contact.imageDataAvailable else {
              promise.reject(
                Exception(name: "ImageNotAvailable", description: "Contact image not available"))
              return
            }
            let (imageUri, thumbUri) = contact.getImageUris()
            promise.resolve([
              "imageUri": imageUri,
              "thumbnailUri": thumbUri,
            ])
          } catch {
            promise.reject(Exception(name: "FetchError", description: error.localizedDescription))
          }
        } else {
          promise.reject(
            Exception(name: "PermissionDenied", description: "Contact permission not granted"))
        }
      }
    }

    AsyncFunction("getMergedContact") { (ids: [String], promise: Promise) in
      store.requestAccess(for: .contacts) { [weak self] granted, error in
        guard let self else { return }
        if granted {
          do {
            let mergedContact = try getMergedContact(fromIds: ids, store: self.store)
            promise.resolve(mergedContact.toDictionary())
          } catch {
            promise.reject(Exception(name: "MergeError", description: error.localizedDescription))
          }
        } else {
          promise.reject(
            Exception(name: "PermissionDenied", description: "Contact permission not granted"))
        }
      }
    }

    AsyncFunction("mergeContacts") { (ids: [String], promise: Promise) in
      store.requestAccess(for: .contacts) { [weak self] granted, error in
        guard let self else { return }
        if granted {
          do {
            let mergedContact = try getMergedContact(fromIds: ids, store: self.store)
            var deletedContacts: [CNContact] = []
            let request = CNSaveRequest()
            request.add(mergedContact, toContainerWithIdentifier: nil)
            for id in ids {
              let contact = try self.store.unifiedContact(
                withIdentifier: id,
                keysToFetch: CNContactKeySets.identifierOnly)
              if let mutableContact = contact.mutableCopy() as? CNMutableContact {
                request.delete(mutableContact)
                deletedContacts.append(contact)
              }
            }

            try self.store.execute(request)

            promise.resolve(
              [
                "added": mergedContact.toDictionary(),
                "deleted": deletedContacts.map { $0.toDictionary() },
              ])
          } catch {
            promise.reject(Exception(name: "MergeError", description: error.localizedDescription))
          }
        } else {
          promise.reject(
            Exception(name: "PermissionDenied", description: "Contact permission not granted"))
        }
      }
    }

    AsyncFunction("presentContactPicker") { (options: [String: Any], promise: Promise) in
      let pickerController = CNContactPickerViewController()
      let delegate = ContactsPickerDelegate(promise: promise)

      contactPickerDelegate = delegate
      pickerController.delegate = delegate
      pickerController.predicateForSelectionOfContact = NSPredicate(value: true)

      if let appearanceMode = options["appearance"] as? String {
        switch appearanceMode.lowercased() {
        case "light":
          pickerController.overrideUserInterfaceStyle = .light
        case "dark":
          pickerController.overrideUserInterfaceStyle = .dark
        default:
          pickerController.overrideUserInterfaceStyle = .unspecified
        }
      }

      appContext?.utilities?.currentViewController()?.present(pickerController, animated: true)
    }.runOnQueue(.main)

    AsyncFunction("removeContact") { (contactId: String, promise: Promise) in
      store.requestAccess(for: .contacts) { [weak self] granted, error in
        guard let self else {
          promise.reject(
            Exception(
              name: "ModuleNotInitialized",
              description: "ContactsKit module not initialized"))
          return
        }
        guard granted else {
          promise.reject(
            Exception(name: "PermissionDenied", description: "Contact permission not granted"))
          return
        }
        do {
          let contact = try self.store.unifiedContact(
            withIdentifier: contactId,
            keysToFetch: CNContactKeySets.identifierOnly)
          let request = CNSaveRequest()
          if let mutableContact = contact.mutableCopy() as? CNMutableContact {
            request.delete(mutableContact)
            try self.store.execute(request)
            promise.resolve(contact.toDictionary())
          } else {
            promise.reject(Exception(name: "NotFound", description: "Contact not found"))
          }
        } catch {
          promise.reject(Exception(name: "DeleteError", description: error.localizedDescription))
        }
      }
    }

    AsyncFunction("saveContactsAsPrivate") { (contactIds: [String], promise: Promise) in
      store.requestAccess(for: .contacts) { [weak self] granted, error in
        guard let self else {
          promise.reject(
            Exception(
              name: "ModuleNotInitialized",
              description: "ContactsKit module not initialized"))
          return
        }
        guard granted else {
          promise.reject(
            Exception(name: "PermissionDenied", description: "Contact permission not granted"))
          return
        }
        do {
          let contacts = try contactIds.map { id in
            try self.store.unifiedContact(
              withIdentifier: id,
              keysToFetch: [CNContactViewController.descriptorForRequiredKeys()]
                as [CNKeyDescriptor])
          }
          for contact in contacts {
            try contact.storePrivate(asNew: true)
          }
          self.sendEvent("onPrivateChange")
          promise.resolve(contacts.map { $0.toDictionary() })
        } catch {
          promise.reject(Exception(name: "SaveError", description: error.localizedDescription))
        }
      }
    }

    AsyncFunction("fetchPrivateContacts") { (promise: Promise) in
      do {
        let contacts = try CNContact.getPrivate()
        promise.resolve(contacts.map { $0.toDictionary() })
      } catch {
        promise.reject(Exception(name: "FetchError", description: error.localizedDescription))
      }
    }

    AsyncFunction("getPrivateContact") { (identifier: String, promise: Promise) in
      do {
        if let contact = try CNContact.getPrivate(identifier: identifier) {
          promise.resolve(contact.toDictionary())
        } else {
          promise.reject(
            Exception(name: "NotFound", description: "Private contact not found"))
        }
      } catch {
        promise.reject(Exception(name: "FetchError", description: error.localizedDescription))
      }
    }

    AsyncFunction("deletePrivateContact") { (identifier: String, promise: Promise) in
      do {
        try CNContact.deletePrivate(identifier: identifier)
        self.sendEvent("onPrivateChange")
        promise.resolve(["identifier": identifier])
      } catch {
        promise.reject(Exception(name: "DeleteError", description: error.localizedDescription))
      }
    }

    AsyncFunction("savePrivateAsContact") { (identifier: String, promise: Promise) in
      store.requestAccess(for: .contacts) { [weak self] granted, error in
        guard let self else {
          promise.reject(
            Exception(
              name: "ModuleNotInitialized",
              description: "ContactsKit module not initialized"))
          return
        }
        guard granted else {
          promise.reject(
            Exception(name: "PermissionDenied", description: "Contact permission not granted"))
          return
        }

        do {
          guard let contact = try CNContact.getPrivate(identifier: identifier) else {
            promise.reject(
              Exception(name: "NotFound", description: "Private contact not found"))
            return
          }
          let request = CNSaveRequest()
          request.add(contact.mutableCopy() as! CNMutableContact, toContainerWithIdentifier: nil)
          try self.store.execute(request)
          promise.resolve(contact.toDictionary())
        } catch {
          promise.reject(Exception(name: "SaveError", description: error.localizedDescription))
        }
      }
    }

    AsyncFunction("presentContactViewer") { (options: [String: Any], promise: Promise) in
      if let contactId = options["contactId"] as? String {
        self.store.requestAccess(for: .contacts) { [weak self] granted, error in
          guard let self else {
            promise.reject(
              Exception(
                name: "ModuleNotInitialized",
                description: "ContactsKit module not initialized"))
            return
          }
          guard granted else {
            promise.reject(
              Exception(name: "PermissionDenied", description: "Contact permission not granted"))
            return
          }

          do {
            let contact = try self.store.unifiedContact(
              withIdentifier: contactId,
              keysToFetch: [CNContactViewController.descriptorForRequiredKeys()]
                as [CNKeyDescriptor])

            self.contactViewController = CNContactViewController(for: contact)
            guard let contactViewController = self.contactViewController else {
              promise.reject(
                Exception(
                  name: "CNContactViewControllerError",
                  description: "Failed to create CNContactViewController"))
              return
            }
            self.configureAndPresentViewer(
              contactViewController, options: options, type: .contact, promise: promise)
          } catch {
            promise.reject(
              Exception(name: "FetchError", description: error.localizedDescription))
          }
          promise.resolve(nil)
        }
        return
      } else if let privateId = options["privateId"] as? String {
        do {
          guard let contact = try CNContact.getPrivate(identifier: privateId) else {
            promise.reject(Exception(name: "NotFound", description: "Private contact not found"))
            return
          }
          contactViewController = CNContactViewController(for: contact)
          guard let contactViewController = self.contactViewController else {
            promise.reject(
              Exception(
                name: "CNContactViewControllerError",
                description: "Failed to create CNContactViewController"))
            return
          }
          self.configureAndPresentViewer(
            contactViewController, options: options, type: .privateContact, promise: promise)
        } catch {
          promise.reject(Exception(name: "FetchError", description: error.localizedDescription))
        }
        promise.resolve(nil)
        return
      } else {
        promise.reject(
          Exception(
            name: "InvalidOptions", description: "Options must contain contactId or privateId"))
        return
      }
    }.runOnQueue(.main)

    AsyncFunction("presentContactsEditor") { (options: [String: Any], promise: Promise) in
      var contactToPresent: CNContact? = nil
      var originalPrivateIdentifier: String? = nil

      if let contactId = options["contactId"] as? String {
        guard let privateContact = try CNContact.getPrivate(identifier: contactId) else {
          promise.reject(Exception(name: "NotFound", description: "Private contact not found"))
          return
        }
        contactToPresent = privateContact.asFreshMutableContact()
        originalPrivateIdentifier = contactId
      }

      contactViewController = CNContactViewController(forNewContact: contactToPresent)

      guard let contactViewController = self.contactViewController else {
        promise.reject(
          Exception(
            name: "CNContactViewControllerError",
            description: "Failed to create CNContactViewController"))
        return
      }

      self.configureAndPresentViewer(
        contactViewController, options: options, type: .privateContact, promise: promise,
        isEditor: true, originalPrivateIdentifier: originalPrivateIdentifier)
    }.runOnQueue(.main)
  }

  private func configureAndPresentViewer(
    _ viewController: CNContactViewController,
    options: [String: Any],
    type: ViewControllerType,
    promise: Promise,
    isEditor: Bool = false,
    originalPrivateIdentifier: String? = nil
  ) {

    let navigationController = UINavigationController(rootViewController: viewController)

    if let appearanceMode = options["appearance"] as? String {
      switch appearanceMode.lowercased() {
      case "light":
        viewController.overrideUserInterfaceStyle = .light
      case "dark":
        viewController.overrideUserInterfaceStyle = .dark
      default:
        viewController.overrideUserInterfaceStyle = .unspecified
      }
    }

    viewController.title = options["title"] as? String ?? nil

    if isEditor {
      viewController.allowsEditing = true
    } else {
      viewController.allowsEditing = false
      let buttonTitle = options["dismissButtonTitle"] as? String ?? "Done"
      let dismissButton = UIBarButtonItem(
        title: buttonTitle,
        style: .done,
        target: self,
        action: #selector(dismissContactViewer)
      )
      viewController.navigationItem.rightBarButtonItem = dismissButton
    }

    var delegate: ContactViewerDelegate

    switch type {
    case .contact:
      delegate = ContactViewerDelegate(promise: promise, store: self.store, type: .contact) {
        [weak self] in
        self?.sendEvent("onContactsChange")
      }
    case .privateContact:
      delegate = ContactViewerDelegate(
        promise: promise, store: self.store, type: .privateContact,
        originalPrivateIdentifier: originalPrivateIdentifier
      ) { [weak self] in
        self?.sendEvent("onPrivateChange")
      }
    }

    self.contactViewerDelegate = delegate
    viewController.delegate = delegate

    if let rootVC = self.appContext?.utilities?.currentViewController() {
      rootVC.present(navigationController, animated: true)
    } else {
      promise.reject(
        Exception(name: "PresentationError", description: "Could not find current view controller"))
    }
  }

  @objc private func dismissContactViewer() {
    contactViewController?.dismiss(animated: true)
  }

}
