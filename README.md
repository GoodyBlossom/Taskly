# Task Flow

Task Flow is a clean, mobile-friendly React Native task manager built with Expo.

## Features

- Add tasks
- Mark tasks complete or active
- Delete tasks
- Persist tasks locally with AsyncStorage
- Run on Android, iOS, and web

## Run locally

```bash
npm install
npm run web
```

## Android APK

The project includes an Expo/EAS APK profile:

```bash
npx eas build -p android --profile preview
```

For a local native APK build, install Java and Android Studio, then run:

```bash
npm run prebuild
npm run apk
```
