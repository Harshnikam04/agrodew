<div align="center">
  <h1>🌱 Agrodew</h1>
  <p>An end-to-end smart agriculture system combining custom IoT hardware, a powerful backend, and a cross-platform mobile application.</p>

  <p>
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
    <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native" />
    <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=white" alt="Firebase" />
    <img src="https://img.shields.io/badge/KiCad-9.0-blue?style=for-the-badge&logo=kicad&logoColor=white" alt="KiCad" />
  </p>
</div>

---

## 📖 Overview

**Agrodew** is a comprehensive solution designed to monitor and manage agricultural data. By deploying custom hardware sensors in the field, data is transmitted to a central backend and displayed in real-time on a mobile application. This empowers farmers and agricultural enthusiasts to make data-driven decisions based on live environmental metrics.

## 🏗️ System Architecture (Monorepo)

This repository contains all three core components of the Agrodew ecosystem:

### 1. `mobile/` 📱
The user-facing mobile application built to provide real-time analytics and controls.
- **Features**: Interactive dashboards, real-time sensor updates, and AI-driven insights (`aiService.js`).
- **Tech**: React Native / Expo.

### 2. `backend/` ⚙️
The core API server that bridges the hardware and the mobile application.
- **Features**: REST API endpoints for receiving data from Arduino/IoT devices, processing sensor readings (Temperature, Humidity, Soil Moisture, Water Level, AQI), and storing them in a Firebase Firestore database.
- **Tech**: Node.js, Express, Firebase Admin SDK.

### 3. `agrodewpcb/` ⚡
The custom-designed Printed Circuit Board (PCB) for data collection.
- **Features**: Integrates multiple sensors and a microcontroller into a single, deployable field unit.
- **Tech**: KiCad 9.0 (Schematics and PCB layouts included).

---

## 🚀 Key Features

- **Real-Time Environmental Monitoring**: Track Temperature, Humidity, Soil Moisture, Water Levels, and Air Quality Index (AQI).
- **IoT Integration**: Direct communication between custom hardware nodes and the cloud backend.
- **AI Analytics**: Intelligent data processing integrated directly into the mobile client.
- **Cloud Database**: Fast, scalable, and secure data storage using Firebase.

---

## 🛠️ Getting Started

To run the project locally, you will need to start both the backend and the mobile app.

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Ensure you have your Firebase Service Account credentials set up.
4. Start the server:
   ```bash
   npm run dev
   ```

### Mobile Setup
1. Open a new terminal and navigate to the mobile directory:
   ```bash
   cd mobile
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the application:
   ```bash
   npm start
   ```

---

## 🤝 Contributing

Contributions are always welcome! Feel free to open an issue or submit a Pull Request if you have suggestions for new features or improvements.

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
