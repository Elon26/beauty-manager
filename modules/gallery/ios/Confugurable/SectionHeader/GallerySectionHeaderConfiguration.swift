enum GallerySectionHeaderConfiguration: String {
  case `default`
  case custom

  var view: any GallerySectionHeaderContent.Type {
    switch self {
    case .default:
      return DefaultGallerySectionHeaderContent.self
    case .custom:
      return CustomGallerySectionHeaderContent.self
    }
  }
}
