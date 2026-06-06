# My App Name

My App Name is a compact native Android WebView wrapper for an offline-ready bundled web app.

The Android app does not use Expo or React Native. It loads the local app from:

```text
file:///android_asset/www/index.html
```

## Run the Web App Locally

The web files live in:

```text
web/
```

You can open `web/index.html` directly in a browser, or serve it locally:

```bash
python -m http.server 8081 -d web
```

Then open:

```text
http://localhost:8081
```

## Build the APK

Make sure Java/JDK and the Android SDK are installed, then run:

```bash
cd android
gradlew assembleRelease
```

On macOS/Linux, use:

```bash
./gradlew assembleRelease
```

## Find the APK

The Gradle output is:

```text
android/app/build/outputs/apk/release/app-release.apk
```

After a successful build, Gradle also copies it to the project root as:

```text
MyAppName-release.apk
```

This app is bundled for offline use. All CSS, JavaScript, images, and assets are local files inside the APK. It does not load CDN files and does not require internet to run.
