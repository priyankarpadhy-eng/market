# Converting IGIT Marketplace to APK

This project is now equipped with **Capacitor**, allowing you to convert your web app into a native Android APK and deploy it to the Play Store.

## Prerequisites
1.  **Node.js & NPM**: Installed on your machine.
2.  **Android Studio**: Download and install it from [developer.android.com](https://developer.android.com/studio).
3.  **Android SDK**: Ensure you have a recent SDK (API 30+) installed via Android Studio.

## Step-by-Step APK Generation

### 1. Sync the Latest Changes
Run this command whenever you change your web code (React files):
```bash
npm run cap:sync
```
*This command builds the React app and copies the files into the Android project.*

### 2. Open in Android Studio
To actually build the APK, you need to open the native project:
```bash
npm run cap:open
```
*This will launch Android Studio with the `android` folder automatically.*

### 3. Build the APK
Once Android Studio is open and finished indexing (wait for the progress bars to finish):
1.  Go to the top menu: **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
2.  Android Studio will compile the app. Once done, a popup will appear at the bottom right. Click **Locate** to find your `app-debug.apk`.

## Deployment to Play Store

### 1. Generate a Signed Bundle
To upload to the Play Store, you need a "Release" version:
1.  In Android Studio, go to **Build** > **Generate Signed Bundle / APK...**
2.  Select **Android App Bundle** (preferred by Google) or **APK**.
3.  Create a new **Key Store** (keep this file and password extremely safe; you cannot update your app if you lose it).
4.  Choose **Release** build variant.

### 2. Google Play Console
1.  Go to [play.google.com/console](https://play.google.com/console).
2.  Create a developer account ($25 one-time fee).
3.  Create a "New App" and upload your `.aab` (App Bundle) file.
4.  Fill in the descriptions, screenshots (from your phone), and privacy policy.

## Tips for Mobile Success
- **App Icon**: We are using `public/images/logo.png` as the source for your app icon.
- **Splash Screen**: You can change the splash screen in `android/app/src/main/res/drawable/`.
- **App Name/ID**: If you ever need to change the name, edit `capacitor.config.json` and run `npx cap sync`.
- **Permissions**: If you add features like camera or GPS, you'll need to update `android/app/src/main/AndroidManifest.xml`.

Happy Coding! 🚀
