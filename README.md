# Отдыхалка для глаз — React Native App

Minimalistic eye relaxation app.

Flow: Splash → Home with a big green Start button → Fullscreen offline video with only Play/Pause and Close controls.

Offline-first: the video is bundled with the app at `assets/video/video.mp4`.

## Prerequisites

- Node 18+
- Xcode (for iOS) and/or Android SDK
- Ruby + Bundler for CocoaPods (iOS)
- Follow RN official setup: https://reactnative.dev/docs/set-up-your-environment

## Install

```sh
npm install

# iOS CocoaPods
bundle install
bundle exec pod install --project-directory=ios
```

## Run

Start Metro in one terminal:

```sh
npm start
```

Run iOS (new window):

```sh
npm run ios
```

Run Android (emulator/device):

```sh
npm run android
```

## Project Structure

- `App.tsx` — Navigation container and Stack (`Splash`, `Home`, `Video`)
- `src/screens/SplashScreen.tsx` — gradient background, logo scale-in, text fade-in, auto-navigate to Home
- `src/screens/HomeScreen.tsx` — large breathing Start button, haptic on press, navigates to Video
- `src/screens/VideoScreen.tsx` — fullscreen `react-native-video` using local asset, Play/Pause (bottom-left) and Close (top-right)
- `assets/video/video.mp4` — bundled offline video
- `PRIVACY_POLICY.md` — App Store guideline 5.1 compliance statement
- `docs/` — marketing + store asset playbooks driven by Viktor Seraleev’s strategy threads

## Tech

- React Native 0.81
- React Navigation 6 (`@react-navigation/native`, `@react-navigation/native-stack`)
- react-native-screens, react-native-gesture-handler
- React Native Reanimated 3
- react-native-video
- react-native-linear-gradient, react-native-vector-icons, react-native-haptic-feedback
- react-native-in-app-review

## Troubleshooting

- After changing `babel.config.js` (Reanimated plugin), clear Metro cache:
  ```sh
  npm start -- --reset-cache
  ```
- If iOS fails to build after adding native deps, run:
  ```sh
  bundle exec pod install --project-directory=ios
  ```
- If the video doesn’t load, ensure the file exists at `assets/video/video.mp4` and Metro includes `mp4` in `metro.config.js` resolver assetExts.

## Notes

- Haptic feedback requires a physical device.
- Vector icons are auto-linked; no manual font config required on RN 0.81.
- Animations use Reanimated worklets; make sure the plugin is the last in `babel.config.js` and that `react-native-reanimated` is imported in `index.js`.
- For marketing, ASO, and compliance procedures see `docs/MARKETING_PLAYBOOK.md`, `docs/STORE_ASSET_PLAN.md`, and `PRIVACY_POLICY.md`.
