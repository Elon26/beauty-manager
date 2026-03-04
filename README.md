# beauty-manager

A commercial mobile application for intermittent fasting.  
The app helps users follow fasting plans, track progress in real time, and stay motivated with reminders and gamification elements.

> Commercial project. Published on the App Store under a different name by the client’s request (public link is not available).

---

## 🥗 About the Project

The project is designed for users who practice intermittent fasting and want a clear, visual way to track fasting and eating windows.  
Users can choose predefined fasting plans or create custom schedules, see the current phase in real time, and receive notifications when phases change.

The app focuses on smooth UX, real-time progress calculation, and offline-first data storage.

---

## 🧰 Tech Stack

**Framework / Platform**

- React Native
- TypeScript

**State / Storage**

- react-native-mmkv (local storage, no backend)

**Infrastructure & Services**

- Firebase Storage
- Firebase Remote Config
- Sentry
- Apphud
- Facebook SDK

**UI / UX**

- Tailwind (NativeWind)
- react-native-reanimated
- i18n (localization)

**Tooling**

- ESLint
- Prettier

---

## ✨ Key Features

- ⏳ Intermittent fasting plans:
  - choose predefined fasting schedules
  - create custom fasting plans
- 📊 Real-time progress tracking:
  - current phase (fasting / eating window)
  - time remaining until phase completion
  - completion percentage
- ⏰ Notifications:
  - reminders on phase start and completion
- 📸 Photo diary:
  - save progress photos
  - group photos by date
- 🏆 Gamification:
  - achievements for continuous usage streaks
- 🖼 Device cleanup:
  - detect low-quality photos
  - find duplicate photos
  - clean up storage directly from the app
- 👥 Duplicate contacts detection:
  - find contacts with similar names
  - find contacts with duplicate phone numbers
  - remove duplicates from the device
- 🔐 Secure local vault:
  - store images, videos, and contacts
  - restrict access from other apps
- 🔑 Password generator & manager:
  - synced with the system password storage
- 🌐 Internet speed test
- 🔍 Search and filtering across multiple sections
- 🎞 Smooth UI transitions and animated charts
- 💾 Local-first data storage using MMKV (no backend)

---

## 👨‍💻 Role & Responsibilities

The project was implemented entirely by me:

- designed the application architecture;
- implemented custom fasting schedule logic;
- built real-time progress tracking with smooth animations;
- implemented photo diary and gamification features;
- integrated notifications and local storage;
- connected third-party services (analytics, crash reporting, monetization);
- prepared the app for production release.

---

## 🧠 Challenges & Technical Decisions

- Implemented complex custom fasting schedule logic for user-defined plans.
- Optimized real-time progress calculations to avoid unnecessary background timers and reduce memory usage.
- Designed a system that gives the impression of continuous background tracking while keeping the app lightweight.
- Ensured smooth synchronization between time calculations, UI animations, and notifications.
- Paid special attention to performance due to frequent UI updates and animated charts.

---

## 🚀 Local Setup

The project cannot be started without a .env file because it contains confidential keys and tokens.

Installation and run:

- npm install
- npm run start

---

## 🧪 Code Quality

- ESLint and Prettier are configured
- No automated tests (manual QA by a dedicated tester)
- Multiple environment variables are used for service configuration

---

## 📌 Notes

This repository is intended to demonstrate architecture, complex time-based logic, and UI/UX implementation.  
The production version is published in the App Store under a different name according to the client’s requirements.
