# Task Flow

Task Flow is a compact React Native mobile task manager. It lets users add tasks, mark tasks complete, delete tasks, filter active and completed tasks, and keep everything saved locally on the phone.

The primary app is in `App.js` and stores tasks with `@react-native-async-storage/async-storage`.

The repo also includes a native Android WebView wrapper around a bundled offline web app. It loads the local app from:

```text
file:///android_asset/www/index.html
```

## Features

- Add a task.
- Mark a task complete or active again.
- Delete a task.
- View all, active, and completed tasks.
- Save tasks locally with device WebView storage.
- Work offline after installation.

## Run Locally

For React Native/Expo:

```bash
npm start
```

Then choose Android, iOS, or web from Expo.

For the bundled web preview:

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

For the included Android wrapper, make sure Java/JDK and the Android SDK are installed, then run:

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
TaskFlow-release.apk
```

This app is bundled for offline use. All CSS, JavaScript, images, and assets are local files inside the APK.
