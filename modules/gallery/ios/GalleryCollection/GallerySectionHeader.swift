import SwiftUI
import UIKit

// MARK: - SwiftUI Content Protocols

protocol GallerySectionHeaderContent: View {
  init(context: GallerySectionHeaderContext)
}

protocol GallerySectionFooterContent: View {
  init(context: GallerySectionFooterContext)
}

protocol GallerySectionBackgroundContent: View {
  init(context: GallerySectionBackgroundContext)
}

// MARK: - Contexts

struct GallerySectionHeaderContext {
  let section: GallerySection
  let itemCount: Int
  let selectionLabel: SelectionButton.SelectionButtonLabel
  let config: GalleryConfig
  let onToggleSelection: () -> Void
  let onSelectAll: (() -> Void)?
  let onDeselectAll: (() -> Void)?
}

struct GallerySectionFooterContext {
  let section: GallerySection
  let itemCount: Int
  let config: GalleryConfig
  let onTap: (() -> Void)?
}

struct GallerySectionBackgroundContext {
  let section: GallerySection
  let config: GalleryConfig
}

// MARK: - Default SwiftUI Content

struct DefaultGallerySectionHeaderContent: GallerySectionHeaderContent {
  let context: GallerySectionHeaderContext

  init(context: GallerySectionHeaderContext) {
    self.context = context
  }

  var body: some View {
    EmptyView()
  }
}

struct DefaultGallerySectionFooterContent: GallerySectionFooterContent {
  let context: GallerySectionFooterContext

  init(context: GallerySectionFooterContext) {
    self.context = context
  }

  var body: some View {
    EmptyView()
  }
}

struct DefaultGallerySectionBackgroundContent: GallerySectionBackgroundContent {
  let context: GallerySectionBackgroundContext

  init(context: GallerySectionBackgroundContext) {
    self.context = context
  }

  var body: some View {
    EmptyView()
  }
}

// MARK: - SwiftUI-hosted Reusable Views

final class GallerySectionHeader: UICollectionReusableView {
  static let reuseIdentifier = "GallerySectionHeader"
  static var galleryConfig = GalleryConfig()

  // Exposed for compatibility with existing code that sets its label externally.
  // Not added as a subview; used as a state holder and callback trigger for SwiftUI rebuilds.
  let selectionButton = SelectionButton()

  // SwiftUI hosting
  private var hostingController: UIHostingController<AnyView>?
  private var currentSection: GallerySection?
  private var currentContext: GallerySectionHeaderContext?

  // Closure that constructs the SwiftUI content
  var contentBuilder: ((GallerySectionHeaderContext) -> AnyView)?

  override init(frame: CGRect) {
    super.init(frame: frame)
    setup()
  }

  required init?(coder: NSCoder) {
    super.init(coder: coder)
    setup()
  }

  private func setup() {
    backgroundColor = .clear

    // Propagate changes from selectionButton.label to SwiftUI view
    selectionButton.onLabelChanged = { [weak self] _ in
      self?.rebuildIfPossible()
    }
  }

  // Configure with section data (called by supplementaryViewProvider)
  func configure(with section: GallerySection) {
    currentSection = section

    let selectionLabel = selectionButton.label
    let context = GallerySectionHeaderContext(
      section: section,
      itemCount: section.assets.count,
      selectionLabel: selectionLabel,
      config: Self.galleryConfig,
      onToggleSelection: {},
      onSelectAll: nil,
      onDeselectAll: nil
    )
    currentContext = context
    updateHostingController(with: context)
  }

  override func prepareForReuse() {
    super.prepareForReuse()
    currentSection = nil
    currentContext = nil

    hostingController?.rootView = AnyView(EmptyView())
    hostingController?.view.removeFromSuperview()
    hostingController = nil
  }

  // MARK: - Hosting

  private func updateHostingController(with context: GallerySectionHeaderContext) {
    let content =
      contentBuilder?(context) ?? AnyView(DefaultGallerySectionHeaderContent(context: context))

    if let host = hostingController {
      host.rootView = content
    } else {
      let host = UIHostingController(rootView: content)
      host.view.backgroundColor = .clear
      host.view.translatesAutoresizingMaskIntoConstraints = false

      addSubview(host.view)
      NSLayoutConstraint.activate([
        host.view.leadingAnchor.constraint(equalTo: leadingAnchor),
        host.view.trailingAnchor.constraint(equalTo: trailingAnchor),
        host.view.topAnchor.constraint(equalTo: topAnchor),
        host.view.bottomAnchor.constraint(equalTo: bottomAnchor),
      ])
      hostingController = host
    }
  }

  private func rebuildIfPossible() {
    guard let section = currentSection else { return }
    configure(with: section)
  }
}

// MARK: - Footer & Background Reusable Views (SwiftUI-hosted)

final class GallerySectionFooter: UICollectionReusableView {
  static let reuseIdentifier = "GallerySectionFooter"

  private var hostingController: UIHostingController<AnyView>?
  private var currentContext: GallerySectionFooterContext?

  var contentBuilder: ((GallerySectionFooterContext) -> AnyView)?

  override init(frame: CGRect) {
    super.init(frame: frame)
    backgroundColor = .clear
  }

  required init?(coder: NSCoder) {
    super.init(coder: coder)
    backgroundColor = .clear
  }

  func configure(with section: GallerySection, config: GalleryConfig, onTap: (() -> Void)? = nil) {
    let context = GallerySectionFooterContext(
      section: section,
      itemCount: section.assets.count,
      config: config,
      onTap: onTap
    )
    currentContext = context
    updateHostingController(with: context)
  }

  override func prepareForReuse() {
    super.prepareForReuse()
    currentContext = nil
    hostingController?.rootView = AnyView(EmptyView())
    hostingController?.view.removeFromSuperview()
    hostingController = nil
  }

  private func updateHostingController(with context: GallerySectionFooterContext) {
    let content =
      contentBuilder?(context) ?? AnyView(DefaultGallerySectionFooterContent(context: context))

    if let host = hostingController {
      host.rootView = content
    } else {
      let host = UIHostingController(rootView: content)
      host.view.backgroundColor = .clear
      host.view.translatesAutoresizingMaskIntoConstraints = false

      addSubview(host.view)
      NSLayoutConstraint.activate([
        host.view.leadingAnchor.constraint(equalTo: leadingAnchor),
        host.view.trailingAnchor.constraint(equalTo: trailingAnchor),
        host.view.topAnchor.constraint(equalTo: topAnchor),
        host.view.bottomAnchor.constraint(equalTo: bottomAnchor),
      ])
      hostingController = host
    }
  }
}

// Background decoration view host. To use this with compositional layout,
// register the decoration kind on the layout and reference this class.
final class GallerySectionBackgroundView: UICollectionReusableView {
  static let elementKind = "GallerySectionBackgroundView"
  // Static providers to supply section data and custom SwiftUI content for decoration views
  static var sectionProvider: ((Int) -> GallerySection?)?
  static var contentProvider: ((GallerySectionBackgroundContext) -> AnyView)?

  private var hostingController: UIHostingController<AnyView>?
  private var currentContext: GallerySectionBackgroundContext?

  var contentBuilder: ((GallerySectionBackgroundContext) -> AnyView)?

  override init(frame: CGRect) {
    super.init(frame: frame)
    backgroundColor = .clear
  }

  required init?(coder: NSCoder) {
    super.init(coder: coder)
    backgroundColor = .clear
  }

  override func apply(_ layoutAttributes: UICollectionViewLayoutAttributes) {
    super.apply(layoutAttributes)
    // Build SwiftUI content on each layout attributes application to reflect section changes
    let config = GallerySectionHeader.galleryConfig
    let sectionIndex = layoutAttributes.indexPath.section
    let section = Self.sectionProvider?(sectionIndex) ?? GallerySection(id: UUID(), assets: [])
    let context = GallerySectionBackgroundContext(section: section, config: config)
    currentContext = context

    // Update SwiftUI content from static content provider or from configuration enum
    if let content = Self.contentProvider?(context) {
      if let host = hostingController {
        host.rootView = content
      } else {
        let host = UIHostingController(rootView: content)
        host.view.backgroundColor = .clear
        host.view.translatesAutoresizingMaskIntoConstraints = false
        addSubview(host.view)
        NSLayoutConstraint.activate([
          host.view.leadingAnchor.constraint(equalTo: leadingAnchor),
          host.view.trailingAnchor.constraint(equalTo: trailingAnchor),
          host.view.topAnchor.constraint(equalTo: topAnchor),
          host.view.bottomAnchor.constraint(equalTo: bottomAnchor),
        ])
        hostingController = host
      }
    } else {
      updateHostingController(with: context)
    }

    // Apply styling
    layer.cornerRadius = context.config.itemCornerRadius
    layer.masksToBounds = true
  }

  func configure(with section: GallerySection, config: GalleryConfig) {
    let context = GallerySectionBackgroundContext(section: section, config: config)
    currentContext = context
    updateHostingController(with: context)
  }

  override func prepareForReuse() {
    super.prepareForReuse()
    currentContext = nil
    hostingController?.rootView = AnyView(EmptyView())
    hostingController?.view.removeFromSuperview()
    hostingController = nil
  }

  private func updateHostingController(with context: GallerySectionBackgroundContext) {
    let content =
      contentBuilder?(context) ?? AnyView(DefaultGallerySectionBackgroundContent(context: context))

    if let host = hostingController {
      host.rootView = content
    } else {
      let host = UIHostingController(rootView: content)
      host.view.backgroundColor = .clear
      host.view.translatesAutoresizingMaskIntoConstraints = false

      addSubview(host.view)
      NSLayoutConstraint.activate([
        host.view.leadingAnchor.constraint(equalTo: leadingAnchor),
        host.view.trailingAnchor.constraint(equalTo: trailingAnchor),
        host.view.topAnchor.constraint(equalTo: topAnchor),
        host.view.bottomAnchor.constraint(equalTo: bottomAnchor),
      ])
      hostingController = host
    }
  }
}

// MARK: - UIKit Compatibility Button (State holder)

final class SelectionButton {
  enum SelectionButtonLabel: String {
    case deselectAll = "Deselect"
    case selectAll = "Select"

    var translated: String {
      // Customize localization here if needed
      switch self {
      case .deselectAll: return "Deselect"
      case .selectAll: return "Select"
      }
    }
  }

  // Callback to notify label changes so the header can rebuild SwiftUI
  var onLabelChanged: ((SelectionButtonLabel) -> Void)?

  var label: SelectionButtonLabel = .deselectAll {
    didSet {
      onLabelChanged?(label)
    }
  }

  init() {}
}
