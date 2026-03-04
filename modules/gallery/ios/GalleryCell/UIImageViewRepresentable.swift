import SwiftUI
import UIKit

struct UIImageViewRepresentable: UIViewRepresentable {
  let imageView: UIImageView

  func makeUIView(context: Context) -> UIImageView {
    imageView
  }

  func updateUIView(_ uiView: UIImageView, context: Context) {
    // ImageView is already configured externally
  }

  func sizeThatFits(_ proposal: ProposedViewSize, uiView: UIImageView, context: Context) -> CGSize?
  {
    // Accept the proposed size from SwiftUI
    return proposal.replacingUnspecifiedDimensions()
  }
}

// Convenience modifier for common styling
extension UIImageViewRepresentable {
  func cornerRadius(_ radius: CGFloat) -> some View {
    self.onAppear {
      imageView.layer.cornerRadius = radius
      imageView.clipsToBounds = true
    }
  }

  func contentMode(_ mode: UIView.ContentMode) -> some View {
    self.onAppear {
      imageView.contentMode = mode
    }
  }
}
