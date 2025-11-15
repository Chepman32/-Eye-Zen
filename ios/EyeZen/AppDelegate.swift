import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  private func ensureAsyncStorageDirectory() {
    let fileManager = FileManager.default
    guard let bundleId = Bundle.main.bundleIdentifier else { return }

    do {
      let supportDir = try fileManager.url(
        for: .applicationSupportDirectory,
        in: .userDomainMask,
        appropriateFor: nil,
        create: true
      )
      let baseDir = supportDir.appendingPathComponent(bundleId, isDirectory: true)
      let storageDir = baseDir.appendingPathComponent("RCTAsyncLocalStorage_V1", isDirectory: true)

      if !fileManager.fileExists(atPath: storageDir.path) {
        try fileManager.createDirectory(at: storageDir, withIntermediateDirectories: true)
      }
    } catch {
      NSLog("Failed to ensure AsyncStorage directory: %@", error.localizedDescription)
    }
  }

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)
    ensureAsyncStorageDirectory()

    factory.startReactNative(
      withModuleName: "EyeZen",
      in: window,
      launchOptions: launchOptions
    )

    return true
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
