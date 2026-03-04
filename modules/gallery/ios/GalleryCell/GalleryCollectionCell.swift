import Photos
import SwiftUI
import UIKit

final class GalleryCollectionCell: UICollectionViewCell {
  static let reuseIdentifier = "GalleryCollectionCell"

  private var hostingController: UIHostingController<AnyView>?
  private let imageView = UIImageView()
  private var imageRequestID: PHImageRequestID?
  private var currentURI: String?
  private var currentContext: GalleryCellContext?

  // Closure to create the SwiftUI content view
  var contentBuilder: ((GalleryCellContext) -> AnyView)?

  override init(frame: CGRect) {
    super.init(frame: frame)
    setupImageView()
  }

  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }

  private func setupImageView() {
    // Don't add imageView to contentView - SwiftUI will manage it through UIViewRepresentable
    imageView.contentMode = .scaleAspectFill
    imageView.clipsToBounds = true
    imageView.alpha = 0.0
    imageView.translatesAutoresizingMaskIntoConstraints = false
  }

  func configure(
    with uri: String,
    itemId: UUID,
    itemIndex: Int,
    sectionIndex: Int,
    isSelected: Bool,
    config: GalleryConfig,
    onTap: @escaping () -> Void
  ) {
    // Only load image if URI changed
    let shouldLoadImage = currentURI != uri
    currentURI = uri

    // Create context
    let context = GalleryCellContext(
      uri: uri,
      itemId: itemId,
      itemIndex: itemIndex,
      sectionIndex: sectionIndex,
      isSelected: isSelected,
      imageView: imageView,
      onTap: onTap,
      config: config
    )

    currentContext = context

    // Load image only if URI changed to prevent flickering
    if shouldLoadImage {
      loadImage(from: uri, config: config)
    }

    // Build SwiftUI view
    updateHostingController(with: context)
  }

  private func updateHostingController(with context: GalleryCellContext) {
    let content = contentBuilder?(context) ?? AnyView(DefaultGalleryCellContent(context: context))

    if let existing = hostingController {
      existing.rootView = content
    } else {
      let hosting = UIHostingController(rootView: content)
      hosting.view.backgroundColor = .clear
      hosting.view.translatesAutoresizingMaskIntoConstraints = false

      contentView.addSubview(hosting.view)
      NSLayoutConstraint.activate([
        hosting.view.topAnchor.constraint(equalTo: contentView.topAnchor),
        hosting.view.leadingAnchor.constraint(equalTo: contentView.leadingAnchor),
        hosting.view.trailingAnchor.constraint(equalTo: contentView.trailingAnchor),
        hosting.view.bottomAnchor.constraint(equalTo: contentView.bottomAnchor),
      ])

      hostingController = hosting
    }
  }

  private func loadImage(from uri: String, config: GalleryConfig) {
    cancelImageRequest()
    imageView.image = nil
    imageView.alpha = 0.0

    guard let asset = PhotoKitHelper.shared.fetchAsset(from: uri) else {
      showErrorState()
      return
    }

    let scale = UIScreen.main.scale
    let targetSize = CGSize(
      width: max(contentView.bounds.width * scale, 100),
      height: max(contentView.bounds.height * scale, 100)
    )

    imageRequestID = PhotoKitHelper.shared.fetchImage(
      for: asset,
      targetSize: targetSize
    ) { [weak self] image in
      guard let self = self, self.currentURI == uri else { return }

      UIView.animate(withDuration: 0.2) {
        self.imageView.alpha = 1.0
      }

      if let image = image {
        self.imageView.image = image
      } else {
        self.showErrorState()
      }

      self.imageRequestID = nil
    }
  }

  private func showErrorState() {
    imageView.alpha = 1.0
    let config = UIImage.SymbolConfiguration(pointSize: 30, weight: .ultraLight)
    imageView.image = UIImage(systemName: "photo.badge.exclamationmark", withConfiguration: config)
    imageView.tintColor = .systemGray.withAlphaComponent(0.5)
    imageView.contentMode = .center
  }

  private func cancelImageRequest() {
    if let requestID = imageRequestID {
      PHImageManager.default().cancelImageRequest(requestID)
      imageRequestID = nil
    }
  }

  func highlight(
    scaleUp: CGFloat = 1.25,
    fadedAlpha: CGFloat = 0.9,
    inDuration: TimeInterval = 0.2,
    outDuration: TimeInterval = 0.3,
    elevatedZPosition: CGFloat = 100
  ) {
    let v = hostingController?.view ?? contentView
    v.layer.removeAllAnimations()
    let previousZ = layer.zPosition
    layer.zPosition = elevatedZPosition
    let fallbackResetDelay = (inDuration * 2) + (outDuration * 2) + 0.15
    DispatchQueue.main.asyncAfter(deadline: .now() + fallbackResetDelay) { [weak self] in
      guard let self = self else { return }
      if self.layer.zPosition == elevatedZPosition {
        self.layer.zPosition = previousZ
      }
    }
    UIView.animate(
      withDuration: inDuration,
      delay: inDuration,
      options: [.allowUserInteraction, .beginFromCurrentState, .curveEaseOut],
      animations: {
        v.transform = CGAffineTransform(scaleX: scaleUp, y: scaleUp)
        v.alpha = fadedAlpha
      },
      completion: { _ in
        UIView.animate(
          withDuration: outDuration,
          delay: outDuration,
          usingSpringWithDamping: 0.85,
          initialSpringVelocity: 0.6,
          options: [.allowUserInteraction, .beginFromCurrentState],
          animations: {
            v.transform = .identity
            v.alpha = 1.0
          },
          completion: { [weak self] _ in
            self?.layer.zPosition = previousZ
          }
        )
      }
    )
  }

  override func prepareForReuse() {
    super.prepareForReuse()
    currentURI = nil
    currentContext = nil
    contentBuilder = nil
    cancelImageRequest()
    imageView.image = nil
    imageView.alpha = 0.0
    hostingController?.rootView = AnyView(EmptyView())

    contentView.layer.removeAllAnimations()
    contentView.transform = .identity
    contentView.alpha = 1.0
    if let hv = hostingController?.view {
      hv.layer.removeAllAnimations()
      hv.transform = .identity
      hv.alpha = 1.0
    }
    layer.zPosition = 0
  }
}
