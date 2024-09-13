
# POS App

This is an open-source Point of Sale (POS) application built using React Native. It supports both Android and iOS platforms and connects to a backend service for managing products, sales, and other related functionalities.

## Features

- Manage product inventory
- Track sales and transactions
- Offline data synchronization
- Simple and intuitive UI for ease of use

## Install dependencies

After cloning the repository, you need to install the project's dependencies.

1. **Navigate to the project directory**:
   ```bash
   cd pos_app
   ```

2. **Install npm dependencies**:
   This will install all the necessary dependencies specified in `package.json`.
   ```bash
   npm install
   ```

3. **Install iOS dependencies** (for macOS users):
   If you're developing for iOS, you'll need to install CocoaPods dependencies.
   Navigate to the `ios` directory and run:
   ```bash
   cd ios
   pod install
   ```

4. **Ensure Android dependencies**:
   Make sure you have installed Android Studio and set up the Android SDK with the required tools as per [React Native's Android Setup](https://reactnative.dev/docs/environment-setup).

5. **Running the app**:
   After installing the dependencies, you're ready to run the app on Android or iOS.
   - For Android:
     ```bash
     npx react-native run-android
     ```
   - For iOS:
     ```bash
     npx react-native run-ios
     ```

## Android Setup

1. Make sure you have installed [Android Studio](https://developer.android.com/studio) and set up the Android SDK.
2. Add the Android SDK's `platform-tools` and `tools` directories to your `PATH`.
3. Enable Developer Mode on your Android device and turn on USB Debugging.
4. Connect your device to your computer, or set up an Android emulator.
5. Run the app using:
   ```bash
   npx react-native run-android
   ```

## iOS Setup

1. Make sure you have Xcode installed. You can get it from the [Mac App Store](https://apps.apple.com/us/app/xcode/id497799835?mt=12).
2. Install CocoaPods if you haven't already:
   ```bash
   sudo gem install cocoapods
   ```
3. Navigate to the `ios` directory and install dependencies:
   ```bash
   cd ios
   pod install
   ```
4. Open the `.xcworkspace` file in Xcode:
   ```bash
   open pos_app.xcworkspace
   ```
5. Build and run the app in Xcode or use:
   ```bash
   npx react-native run-ios
   ```

## Usage

To start using the POS app:

1. **Run the app**:
   - Android: 
     ```bash
     npx react-native run-android
     ```
   - iOS:
     ```bash
     npx react-native run-ios
     ```

2. **Interacting with the App**:
   Once the app is running, you can start managing products, processing sales, and syncing data with the backend service.

## Contributing

Contributions are welcome! If you'd like to contribute to this project, please fork the repository and use a feature branch. Pull requests are warmly welcome.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Local Development Issues

If you encounter any issues while setting up the project locally, here are a few common problems and solutions:

- **Error: Command `pod install` failed**: Make sure CocoaPods is installed and you have navigated to the `ios` directory before running `pod install`.
- **Android build failed**: Ensure that you have the correct Android SDK version installed and that you have accepted all SDK licenses in Android Studio.
- **React Native package issues**: Sometimes, clearing the cache helps:
   ```bash
   npx react-native start --reset-cache
   ```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
