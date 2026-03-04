enum GallerySectionBackgroundConfiguration: String {
  case `default`
  case custom

  var view: any GallerySectionBackgroundContent.Type {
    switch self {
    case .default:
      return DefaultGallerySectionBackgroundContent.self
    case .custom:
      return CustomGallerySectionBackgroundContent.self
    }
  }
}
