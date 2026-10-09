# Fasting & Habit Tracker (Client App)

A modern, high-performance client application focused on complex time-based logic, real-time calculations, and smooth user interfaces.

---

## 🥗 About the Project

The application is designed for users who follow intermittent fasting schedules, providing real-time progress tracking, custom schedule configurations, and high-frequency UI updates.

The project focuses on smooth animations, predictable state management, and an offline-first architecture.

---

## 🧰 Tech Stack

**Framework & Core**
- React Native / Component-Driven Architecture
- TypeScript

**State & Local Storage**
- react-native-mmkv (local-first storage, no backend)

**Infrastructure & Services**
- Firebase (Storage, Remote Config)
- Sentry, Apphud

**UI & Styling**
- Tailwind CSS (NativeWind)
- react-native-reanimated
- i18n (localization)

**Tooling**
- ESLint, Prettier

---

## ✨ Key Features & Highlights

- **Custom Schedules:** Support for both predefined fasting plans and fully flexible user-defined configurations.
- **Real-Time Calculations:** Dynamic progress tracking (fasting vs. eating windows, remaining time, completion percentages).
- **Interactive UI:** Smooth transitions, animated charts, and high-frequency UI state updates.
- **Offline-First Architecture:** Fast local data persistence using MMKV without relying on a remote backend.
- **Monetization & Analytics:** Integrated subscriptions (Apphud), crash reporting (Sentry), and feature flags (Remote Config).

---

## 👨‍💻 Role & Engineering Contributions

- Designed and implemented the complete application architecture from scratch.
- Developed complex time-based scheduling algorithms and state synchronization logic.
- Built performance-optimized UI components with smooth animations and zero layout thrashing.
- Integrated third-party SDKs for analytics, monitoring, and in-app purchases.

---

## 🚀 Local Setup

Clone the repository and install dependencies to run the project locally:

```bash
# Clone the repository
git clone [https://github.com/Elon26/beauty-manager.git](https://github.com/Elon26/beauty-manager.git)

# Install dependencies
npm install

# Run the project
npm run start
