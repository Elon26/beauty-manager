import SwiftUI

struct CustomGallerySectionBackgroundContent: GallerySectionBackgroundContent {
  let context: GallerySectionBackgroundContext

  init(context: GallerySectionBackgroundContext) {
    self.context = context
  }

  var body: some View {
    RoundedRectangle(cornerRadius: 8)
      .fill(.blue)
      .frame(maxWidth: .infinity, maxHeight: .infinity)
  }
}
