import UIKit

class SiteCredentialCell: UITableViewCell {

  @IBOutlet weak var loginLabel: UILabel!
  @IBOutlet weak var urlLabel: UILabel!

  override func layoutSubviews() {
    super.layoutSubviews()

    // contentView.frame = contentView.frame.inset(by: UIEdgeInsets(top: 15, left: 20, bottom: 10, right: 10))
  }
  
  override func awakeFromNib() {
    super.awakeFromNib()
        // Initialization code
  }

  override func setSelected(_ selected: Bool, animated: Bool) {
    super.setSelected(selected, animated: animated)

    // Configure the view for the selected state
  }

}
