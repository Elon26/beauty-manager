import ContactsUI
import ExpoModulesCore

class ContactsPickerDelegate: NSObject, CNContactPickerDelegate {
  private var promise: Promise

  init(promise: Promise) {
    self.promise = promise
    super.init()
  }

  func contactPicker(_ picker: CNContactPickerViewController, didSelect contact: CNContact) {
    promise.resolve([contact.toDictionary()])
  }

  func contactPicker(_ picker: CNContactPickerViewController, didSelect contacts: [CNContact]) {
    promise.resolve(contacts.map { $0.toDictionary() })
  }

  func contactPickerDidCancel(_ picker: CNContactPickerViewController) {
    promise.reject(Exception(name: "UserCancelled", description: "Contact picker was cancelled"))
  }
}
