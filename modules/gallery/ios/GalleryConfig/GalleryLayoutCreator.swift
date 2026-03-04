import UIKit

protocol GalleryLayoutCreator {
  func createLayout(config: GalleryConfig) -> UICollectionViewLayout
}
