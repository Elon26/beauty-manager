import SwiftUI
import UIKit

enum GalleryLayoutType {
  case flow
  case horizontal
  case mosaic

  init?(rawValue: String) {
    switch rawValue {
    case "flow":
      self = .flow
    case "horizontal":
      self = .horizontal
    case "mosaic":
      self = .mosaic
    default:
      return nil
    }
  }
}

// MARK: - Section SwiftUI Content Configuration

struct GalleryConfig {
  let layoutType: GalleryLayoutType
  let numberOfColumns: Int
  let gap: CGFloat
  let sectionInset: UIEdgeInsets
  let itemAspectRatio: CGFloat
  let sectionHeaderHeight: CGFloat
  let sectionFooterHeight: CGFloat
  let contentInset: UIEdgeInsets
  let toggleSelectionOnTap: Bool
  let itemCornerRadius: CGFloat
  let cellConfiguration: GalleryCellConfiguration
  let headerConfiguration: GallerySectionHeaderConfiguration
  let footerConfiguration: GallerySectionFooterConfiguration
  let backgroundConfiguration: GallerySectionBackgroundConfiguration
  let actions: [GalleryContextAction]

  init(
    layoutType: GalleryLayoutType = .flow,
    numberOfColumns: Int = 3,
    gap: CGFloat = 8,
    sectionInset: UIEdgeInsets = UIEdgeInsets(top: 0, left: 16, bottom: 0, right: 16),
    itemAspectRatio: CGFloat = 1.0,
    sectionHeaderHeight: CGFloat = 56,
    sectionFooterHeight: CGFloat = 56,
    contentInset: UIEdgeInsets = UIEdgeInsets(top: 0, left: 0, bottom: 0, right: 0),
    toggleSelectionOnTap: Bool = true,
    itemCornerRadius: CGFloat = 5,
    cellConfiguration: String = "default",
    headerConfiguration: String = "default",
    footerConfiguration: String = "default",
    backgroundConfiguration: String = "default",
    actions: [GalleryContextAction] = []
  ) {
    self.layoutType = layoutType
    self.numberOfColumns = numberOfColumns
    self.gap = gap
    self.sectionInset = sectionInset
    self.itemAspectRatio = itemAspectRatio
    self.sectionHeaderHeight = sectionHeaderHeight
    self.sectionFooterHeight = sectionFooterHeight
    self.contentInset = contentInset
    self.toggleSelectionOnTap = toggleSelectionOnTap
    self.itemCornerRadius = itemCornerRadius
    self.cellConfiguration =
      GalleryCellConfiguration(rawValue: cellConfiguration) ?? GalleryCellConfiguration.default
    self.headerConfiguration =
      GallerySectionHeaderConfiguration(rawValue: headerConfiguration)
      ?? GallerySectionHeaderConfiguration.default
    self.footerConfiguration =
      GallerySectionFooterConfiguration(rawValue: footerConfiguration)
      ?? GallerySectionFooterConfiguration.default
    self.backgroundConfiguration =
      GallerySectionBackgroundConfiguration(rawValue: backgroundConfiguration)
      ?? GallerySectionBackgroundConfiguration.default
    self.actions = actions
  }

  init(from mutableConfig: MutableGalleryConfig) {
    self.layoutType = mutableConfig.layoutType
    self.numberOfColumns = mutableConfig.numberOfColumns
    self.gap = mutableConfig.gap
    self.sectionInset = mutableConfig.sectionInset
    self.itemAspectRatio = mutableConfig.itemAspectRatio
    self.sectionHeaderHeight = mutableConfig.sectionHeaderHeight
    self.sectionFooterHeight = mutableConfig.sectionFooterHeight
    self.contentInset = mutableConfig.contentInset
    self.toggleSelectionOnTap = mutableConfig.toggleSelectionOnTap
    self.itemCornerRadius = mutableConfig.itemCornerRadius
    self.cellConfiguration =
      GalleryCellConfiguration(rawValue: mutableConfig.cellConfiguration)
      ?? GalleryCellConfiguration.default
    self.headerConfiguration =
      GallerySectionHeaderConfiguration(rawValue: mutableConfig.headerConfiguration)
      ?? GallerySectionHeaderConfiguration.default
    self.footerConfiguration =
      GallerySectionFooterConfiguration(rawValue: mutableConfig.footerConfiguration)
      ?? GallerySectionFooterConfiguration.default
    self.backgroundConfiguration =
      GallerySectionBackgroundConfiguration(rawValue: mutableConfig.backgroundConfiguration)
      ?? GallerySectionBackgroundConfiguration.default
    self.actions = mutableConfig.actions
  }

  var collectionLayout: UICollectionViewLayout {
    createLayout()
  }

  func createLayout() -> UICollectionViewLayout {
    let layoutCreator = layoutCreatorForType(layoutType)
    return layoutCreator.createLayout(config: self)
  }

  private func layoutCreatorForType(_ type: GalleryLayoutType) -> GalleryLayoutCreator {
    switch type {
    case .flow:
      return FlowLayoutCreator()
    case .horizontal:
      if #available(iOS 13.0, *) {
        return HorizontalLayoutCreator()
      } else {
        return FlowLayoutCreator()
      }
    case .mosaic:
      if #available(iOS 13.0, *) {
        return MosaicLayoutCreator()
      } else {
        return FlowLayoutCreator()
      }
    }
  }

  var itemSize: CGSize {
    let screenWidth = UIScreen.main.bounds.width
    let scale = UIScreen.main.scale
    let horizontalSectionInsets = sectionInset.left + sectionInset.right
    let horizontalContentInsets = contentInset.left + contentInset.right
    let numberOfColumnsFloat = CGFloat(numberOfColumns)
    let totalGapWidth = gap * (numberOfColumnsFloat - 1)
    let availableWidth =
      screenWidth - horizontalSectionInsets - horizontalContentInsets - totalGapWidth
    let itemWidth = round(availableWidth / numberOfColumnsFloat * scale) / scale
    let itemHeight = round(itemWidth / itemAspectRatio * scale) / scale
    return CGSize(width: itemWidth, height: itemHeight)
  }
}

private let defaultValues = GalleryConfig()

struct MutableGalleryConfig {
  var layoutType = defaultValues.layoutType
  var numberOfColumns: Int = defaultValues.numberOfColumns
  var gap: CGFloat = defaultValues.gap
  var sectionInset: UIEdgeInsets = defaultValues.sectionInset
  var itemAspectRatio: CGFloat = defaultValues.itemAspectRatio
  var sectionHeaderHeight: CGFloat = defaultValues.sectionHeaderHeight
  var sectionFooterHeight: CGFloat = defaultValues.sectionFooterHeight
  var contentInset: UIEdgeInsets = defaultValues.contentInset
  var toggleSelectionOnTap: Bool = defaultValues.toggleSelectionOnTap
  var itemCornerRadius: CGFloat = defaultValues.itemCornerRadius
  var cellConfiguration: String = defaultValues.cellConfiguration.rawValue
  var headerConfiguration: String = defaultValues.headerConfiguration.rawValue
  var footerConfiguration: String = defaultValues.footerConfiguration.rawValue
  var backgroundConfiguration: String = defaultValues.backgroundConfiguration.rawValue
  var actions: [GalleryContextAction] = defaultValues.actions

  init() {}

  init(from config: [String: Any], with existingConfig: GalleryConfig? = nil) {
    if let existingConfig {
      self.layoutType = existingConfig.layoutType
      self.numberOfColumns = existingConfig.numberOfColumns
      self.gap = existingConfig.gap
      self.sectionInset = existingConfig.sectionInset
      self.itemAspectRatio = existingConfig.itemAspectRatio
      self.sectionHeaderHeight = existingConfig.sectionHeaderHeight
      self.sectionFooterHeight = existingConfig.sectionFooterHeight
      self.contentInset = existingConfig.contentInset
      self.toggleSelectionOnTap = existingConfig.toggleSelectionOnTap
      self.itemCornerRadius = existingConfig.itemCornerRadius
      self.cellConfiguration = existingConfig.cellConfiguration.rawValue
      self.headerConfiguration = existingConfig.headerConfiguration.rawValue
      self.footerConfiguration = existingConfig.footerConfiguration.rawValue
      self.backgroundConfiguration = existingConfig.backgroundConfiguration.rawValue
      self.actions = existingConfig.actions
    }

    for prop in config {
      switch prop.key {
      case "layoutType":
        self.layoutType =
          GalleryLayoutType(rawValue: prop.value as? String ?? "") ?? .flow
      case "numberOfColumns":
        if let numberOfColumns = prop.value as? Int {
          self.numberOfColumns = numberOfColumns
        }
      case "gap":
        if let gap = prop.value as? CGFloat {
          self.gap = gap
        }
      case "sectionInset":
        if let sectionInset = prop.value as? [String: CGFloat] {
          self.sectionInset = UIEdgeInsets(
            top: sectionInset["top"] ?? 0,
            left: sectionInset["left"] ?? 0,
            bottom: sectionInset["bottom"] ?? 0,
            right: sectionInset["right"] ?? 0,
          )
        }
      case "contentInset":
        if let contentInset = prop.value as? [String: CGFloat] {
          self.contentInset = UIEdgeInsets(
            top: contentInset["top"] ?? 0,
            left: contentInset["left"] ?? 0,
            bottom: contentInset["bottom"] ?? 0,
            right: contentInset["right"] ?? 0,
          )
        }
      case "itemAspectRatio":
        if let itemAspectRatio = prop.value as? CGFloat {
          self.itemAspectRatio = itemAspectRatio
        }
      case "sectionHeaderHeight":
        if let sectionHeaderHeight = prop.value as? CGFloat {
          self.sectionHeaderHeight = sectionHeaderHeight
        }
      case "sectionFooterHeight":
        if let sectionFooterHeight = prop.value as? CGFloat {
          self.sectionFooterHeight = sectionFooterHeight
        }
      case "toggleSelectionOnTap":
        if let toggleSelectionOnTap = prop.value as? Bool {
          self.toggleSelectionOnTap = toggleSelectionOnTap
        }
      case "itemCornerRadius":
        if let itemCornerRadius = prop.value as? CGFloat {
          self.itemCornerRadius = itemCornerRadius
        }
      case "cellConfiguration":
        if let cellConfiguration = prop.value as? String {
          self.cellConfiguration = cellConfiguration
        }
      case "sectionHeaderConfiguration":
        if let headerConfiguration = prop.value as? String {
          self.headerConfiguration = headerConfiguration
        }
      case "sectionFooterConfiguration":
        if let footerConfiguration = prop.value as? String {
          self.footerConfiguration = footerConfiguration
        }
      case "sectionBackgroundConfiguration":
        if let backgroundConfiguration = prop.value as? String {
          self.backgroundConfiguration = backgroundConfiguration
        }
      case "actions":
        if let actions = prop.value as? [[String: Any]] {
          self.actions = actions.map { GalleryContextAction($0) }
        }
      default:
        break
      }
    }
  }
}

struct GalleryContextAction {
  let id: String
  let title: String
  let symbol: String
  let attributes: UIMenuElement.Attributes
  let state: UIMenuElement.State

  init(_ dict: [String: Any]) {
    id = dict["id"] as? String ?? ""
    title = dict["title"] as? String ?? ""
    symbol = dict["symbol"] as? String ?? ""

    let attributeNames = dict["attributes"] as? [String] ?? []
    attributes = attributeNames.reduce(into: UIMenuElement.Attributes()) { result, attr in
      switch attr {
      case "disabled":
        result.insert(.disabled)
      case "destructive":
        result.insert(.destructive)
      case "hidden":
        result.insert(.hidden)
      default:
        break
      }
    }

    state = {
      switch dict["state"] as? String {
      case "on": return .on
      case "off": return .off
      case "mixed": return .mixed
      default: return .off
      }
    }()

  }
}
