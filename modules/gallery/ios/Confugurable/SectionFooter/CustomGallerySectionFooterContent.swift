import SwiftUI

struct CustomGallerySectionFooterContent: GallerySectionFooterContent {
  let context: GallerySectionFooterContext

  init(context: GallerySectionFooterContext) {
    self.context = context
  }

  var body: some View {
    HStack {
      Spacer()
      Text("Items count: \(context.itemCount)")
        .font(.system(size: 12, weight: .regular))
        .foregroundColor(.black)
        .padding(.vertical, 6)
      Spacer()
    }
    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .center)
    .background(.green.opacity(0.5))
    .clipShape(RoundedRectangle(cornerRadius: 20))
    .onTapGesture {
      context.onTap?()
    }
  }
}
