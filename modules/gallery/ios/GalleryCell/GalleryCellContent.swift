import SwiftUI

protocol GalleryCellContent: View {
  init(context: GalleryCellContext)
}

// Type-erased wrapper for storage
struct AnyGalleryCellContent: View {
  private let content: AnyView

  init<Content: GalleryCellContent>(_ contentType: Content.Type, context: GalleryCellContext) {
    self.content = AnyView(contentType.init(context: context))
  }

  var body: some View {
    content
  }
}
