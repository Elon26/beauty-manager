final class JSEventsDelegate {
  enum Events: String, CaseIterable {
    case onLookupStarted,
      onLookupProgressChange,
      onIntermediateResult,
      onLookupFinished
  }

  enum ProcessName: String {
    case similarPhotos,
      blurryPhotos
  }

  private let sendEvent: (String, [String: Any?]) -> Void

  init(sendEvent: @escaping (String, [String: Any?]) -> Void) {
    self.sendEvent = sendEvent
  }

  private func emit(_ name: String, _ payload: [String: Any?] = [:]) {
    sendEvent(name, payload)
  }

  func onLookupStarted(process name: ProcessName) {
    emit(
      Events.onLookupStarted.rawValue,
      [
        "processName": name.rawValue
      ])
  }

  func onLookupProgressChange(processName: ProcessName, progress: Double) {
    emit(
      Events.onLookupProgressChange.rawValue,
      [
        "processName": processName.rawValue,
        "progress": progress,
      ])
  }

  func onIntermediateResult(result: DuplicatesResult) {
    emit(
      Events.onIntermediateResult.rawValue,
      result.toDictionary()
    )
  }

  func onLookupFinished(process name: ProcessName) {
    emit(
      Events.onLookupFinished.rawValue,
      [
        "processName": name.rawValue
      ])
  }
}
