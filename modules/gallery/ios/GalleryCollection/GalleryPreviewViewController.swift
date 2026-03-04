import Photos
import UIKit

final class GalleryPreviewViewController: UIViewController {
  private let uri: String
  private let cornerRadius: CGFloat
  private var imageView = UIImageView()
  private var imageRequestID: PHImageRequestID?
  private var activityIndicator = UIActivityIndicatorView(style: .large)

  init(uri: String, cornerRadius: CGFloat = 0) {
    self.uri = uri
    self.cornerRadius = cornerRadius
    super.init(nibName: nil, bundle: nil)
    modalPresentationStyle = .overFullScreen
  }

  required init?(coder: NSCoder) {
    fatalError("init(coder:) has not been implemented")
  }

  override func viewDidLoad() {
    super.viewDidLoad()
    setupView()
    loadImage()
  }

  private func setupView() {
    view.backgroundColor = .clear

    imageView.translatesAutoresizingMaskIntoConstraints = false
    imageView.contentMode = .scaleAspectFill
    imageView.backgroundColor = .systemGray2
    imageView.layer.cornerRadius = cornerRadius
    imageView.layer.masksToBounds = true

    activityIndicator.translatesAutoresizingMaskIntoConstraints = false
    activityIndicator.color = .white
    activityIndicator.startAnimating()

    view.addSubview(imageView)
    view.addSubview(activityIndicator)

    NSLayoutConstraint.activate([
      imageView.topAnchor.constraint(equalTo: view.topAnchor),
      imageView.leadingAnchor.constraint(equalTo: view.leadingAnchor),
      imageView.trailingAnchor.constraint(equalTo: view.trailingAnchor),
      imageView.bottomAnchor.constraint(equalTo: view.bottomAnchor),
    ])

    NSLayoutConstraint.activate([
      activityIndicator.centerXAnchor.constraint(equalTo: view.centerXAnchor),
      activityIndicator.centerYAnchor.constraint(equalTo: view.centerYAnchor),
    ])
  }

  private func loadImage() {
    guard let asset = PhotoKitHelper.shared.fetchAsset(from: uri) else { return }

    let scale = UIScreen.main.scale
    let targetSize = CGSize(
      width: max(view.bounds.width * scale, 1000),
      height: max(view.bounds.height * scale, 1000)
    )

    let options = PHImageRequestOptions()
    options.deliveryMode = .opportunistic
    options.resizeMode = .none
    options.isNetworkAccessAllowed = true

    imageRequestID = PHImageManager.default().requestImage(
      for: asset,
      targetSize: targetSize,
      contentMode: .aspectFit,
      options: options
    ) { [weak self] image, _ in
      self?.imageView.image = image
      self?.activityIndicator.stopAnimating()
    }
  }

  deinit {
    if let id = imageRequestID {
      PHImageManager.default().cancelImageRequest(id)
    }
  }
}
