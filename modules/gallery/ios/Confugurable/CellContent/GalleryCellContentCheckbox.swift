import SwiftUI

/// GalleryCellContentCheckbox is a custom implementation of GalleryCellContent that provides a custom UI for displaying gallery items.
/// GalleryCellContext:
/// - uri: The URI of the gallery item.
/// - itemId: The unique identifier of the gallery item.
/// - itemIndex: The index of the gallery item within its section.
/// - sectionIndex: The index of the section containing the gallery item.
/// - isSelected: Whether the gallery item is selected.
/// - imageView: The UIImageView representing the gallery item.
/// - onTap: A closure to handle the tap gesture on the gallery item.
/// - config: The configuration for the gallery.
struct GalleryCellContentCheckbox: GalleryCellContent {
  let context: GalleryCellContext

  init(context: GalleryCellContext) {
    self.context = context
  }

  var body: some View {
    GeometryReader { geometry in
      ZStack(alignment: .topTrailing) {
        UIImageViewRepresentable(imageView: context.imageView)
          .frame(width: geometry.size.width, height: geometry.size.height)
          .clipped()
          .cornerRadius(context.config.itemCornerRadius)

        if context.isSelected {
          ZStack {
            RoundedRectangle(cornerRadius: 6)
              .fill(
                LinearGradient(
                  gradient: Gradient(colors: [
                    Color(hex: "1E99F9"),
                    Color(hex: "68BDFF"),
                    Color(hex: "096AB9")
                  ]),
                  startPoint: .leading,
                  endPoint: .trailing
                )
              )
              .frame(width: 24, height: 24)
            
            Image(systemName: "checkmark")
              .font(.system(size: 16, weight: .bold))
              .foregroundColor(.white)
          }
          .padding(8)
        } else {
          RoundedRectangle(cornerRadius: 6)
            .stroke(Color(hex: "9C9C9C"), lineWidth: 2)
            .frame(width: 24, height: 24)
            .background(Color.clear)
            .padding(8)
        }
      }
    }
    .contentShape(Rectangle())
    .onTapGesture(perform: context.onTap)
  }
}

extension Color {
  init(hex: String) {
    let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
    var int: UInt64 = 0
    Scanner(string: hex).scanHexInt64(&int)
    let a, r, g, b: UInt64
    switch hex.count {
    case 3:
      (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
    case 6: 
      (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
    case 8:
      (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
    default:
      (a, r, g, b) = (1, 1, 1, 0)
    }
    self.init(
      .sRGB,
      red: Double(r) / 255,
      green: Double(g) / 255,
      blue:  Double(b) / 255,
      opacity: Double(a) / 255
    )
  }
}