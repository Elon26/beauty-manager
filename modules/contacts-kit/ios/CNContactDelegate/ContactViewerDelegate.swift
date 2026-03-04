import Contacts
import ContactsUI
import ExpoModulesCore

class ContactViewerDelegate: NSObject, CNContactViewControllerDelegate {
  private var promise: Promise
  private var store: CNContactStore
  private var onContactWasUpdated: () -> Void
  private var viewControllerType: ViewControllerType
  private var originalPrivateIdentifier: String?

  init(
    promise: Promise, store: CNContactStore, type: ViewControllerType,
    originalPrivateIdentifier: String? = nil,
    onContactWasUpdated: @escaping () -> Void = {}
  ) {
    self.promise = promise
    self.store = store
    self.originalPrivateIdentifier = originalPrivateIdentifier
    self.onContactWasUpdated = onContactWasUpdated
    self.viewControllerType = type
    super.init()
  }

  func contactViewController(
    _ viewController: CNContactViewController, didCompleteWith contact: CNContact?
  ) {
    switch viewControllerType {
    case .privateContact:
      let originalIdentifier = viewController.contact.identifier
      handleDidComplete(private: contact, originalIdentifier: originalIdentifier)
    case .contact:
      handleDidComplete(contact: contact)
    }
    viewController.dismiss(animated: true)
  }

  private func handleDidComplete(private contact: CNContact?, originalIdentifier: String?) {

    guard let contact = contact else {
      promise.resolve(nil)
      return
    }

    do {
      try contact.storePrivate(asNew: false)

      let oldIdentifier = originalPrivateIdentifier ?? originalIdentifier
      if let oldIdentifier, oldIdentifier != contact.identifier {
        try CNContact.deletePrivate(identifier: oldIdentifier)
      }

      if !contact.identifier.isEmpty {
        do {
          let systemContact = try store.unifiedContact(
            withIdentifier: contact.identifier,
            keysToFetch: [CNContactIdentifierKey as CNKeyDescriptor])
          let deleteRequest = CNSaveRequest()
          deleteRequest.delete(systemContact.mutableCopy() as! CNMutableContact)
          try store.execute(deleteRequest)
        } catch {
        }
      }

      onContactWasUpdated()
      promise.resolve(contact.toDictionary())
    } catch {
      promise.reject(
        Exception(
          name: "ContactStoreError",
          description: "Failed to store contact privately: \(error.localizedDescription)"))
    }
  }

  private func handleDidComplete(contact: CNContact?) {
    if let contact = contact {
      do {
        let request = CNSaveRequest()
        if let mutableContact = contact.mutableCopy() as? CNMutableContact {
          request.update(mutableContact)
          try self.store.execute(request)
          onContactWasUpdated()
        }
        promise.resolve(contact.toDictionary())
      } catch {
        promise.reject(
          Exception(
            name: "ContactUpdateError",
            description: "Failed to update contact: \(error.localizedDescription)"))
        return
      }
    } else {
      promise.resolve(nil)
    }
  }

}

enum ViewControllerType {
  case contact
  case privateContact
}
