import SwiftUI

struct DefaultGalleryCellContent: GalleryCellContent {
  let context: GalleryCellContext

  init(context: GalleryCellContext) {
    self.context = context
  }

  var body: some View {
    GeometryReader { geometry in
      UIImageViewRepresentable(imageView: context.imageView)
        .frame(width: geometry.size.width, height: geometry.size.height)
        .clipped()
        .cornerRadius(context.config.itemCornerRadius)
    }
    .contentShape(Rectangle())
    .onTapGesture {
      context.onTap()
    }
  }
}
