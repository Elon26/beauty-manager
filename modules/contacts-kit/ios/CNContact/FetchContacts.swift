import Contacts

func fetchContacts(
  from store: CNContactStore, keysToFetch: [any CNKeyDescriptor], predicate: NSPredicate? = nil
) throws
  -> [CNContact]
{
  let request = CNContactFetchRequest(keysToFetch: keysToFetch)
  if let predicate {
    request.predicate = predicate
  }

  request.sortOrder = .userDefault
  var contacts: [CNContact] = []
  try store.enumerateContacts(with: request) { contact, stop in
    contacts.append(contact)
  }
  return contacts
}
