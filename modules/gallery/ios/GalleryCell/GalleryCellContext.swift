import UIKit

struct GalleryCellContext {
  let uri: String
  let itemId: UUID
  let itemIndex: Int
  let sectionIndex: Int
  let isSelected: Bool
  let imageView: UIImageView
  let onTap: () -> Void
  let config: GalleryConfig
}
