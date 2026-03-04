enum GallerySectionFooterConfiguration: String {
  case `default`
  case custom

  var view: any GallerySectionFooterContent.Type {
    switch self {
    case .default:
      return DefaultGallerySectionFooterContent.self
    case .custom:
      return CustomGallerySectionFooterContent.self
    }
  }
}
