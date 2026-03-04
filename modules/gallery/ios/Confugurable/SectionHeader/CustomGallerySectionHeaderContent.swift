import SwiftUI

struct CustomGallerySectionHeaderContent: GallerySectionHeaderContent {
    let context: GallerySectionHeaderContext

    init(context: GallerySectionHeaderContext) {
        self.context = context
    }

    var body: some View {
        HStack {
            Text("Similar photos: \(context.itemCount)")
                .font(.system(size: 14))
                .foregroundColor(Color(hex: "#9C9C9C"))
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.leading, 20) 
        }
        .padding(.vertical, 10)
    }
}
