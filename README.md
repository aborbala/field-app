# FIELD // COLLECTOR

> **Offline GPS Data & Map Survey Tool**  
> A professional-grade, browser-based GIS field data collection tool.

[![Vite](https://img.shields.io/badge/Build-Vite-646CFF?logo=vite)](https://vitejs.dev/)
[![Vitest](https://img.shields.io/badge/Tests-Vitest-6E9F18?logo=vitest)](https://vitest.dev/)
[![PWA](https://img.shields.io/badge/App-PWA-5A0FC8?logo=pwa)](https://web.dev/progressive-web-apps/)

**Field Collector** is a "private-by-design" geolocation utility built for field researchers, surveyors, and GIS enthusiasts. It allows for high-precision GPS point capture and polygon boundary drafting directly in your browser, even when offline.

---

## 🛠 Tech Stack

- **Core**: Vanilla JavaScript (ES Modules), HTML5, CSS3.
- **Mapping**: [LeafletJS](https://leafletjs.com/) for interactive maps and geometry handling.
- **Build System**: [Vite](https://vitejs.dev/) for modern bundling and development server.
- **Testing**: [Vitest](https://vitest.dev/) with JSDOM for unit and integration testing.
- **Design**: Bespoke "Industrial/Cyberpunk" CSS design system with [Google Fonts](https://fonts.google.com/) (JetBrains Mono & Bebas Neue) and [FontAwesome](https://fontawesome.com/).
- **PWA**: Service Worker integration for full offline capability.

---

## ✨ Key Features

1. **Survey Mode (Points)**
   - Capture single pin locations at your current GPS position or manually via map interaction.
   - Assign custom TAG_IDs to each survey point.

2. **Poly Mode (Boundaries)**
   - Outline precise areas or paths by placing vertices.
   - Real-time polygon rendering with UNDO/CANCEL controls.
   - Automatic center-point calculation for area management.

3. **Data Management**
   - **Local Database**: View all collected items in a sleek bottom-drawer interface.
   - **Crosshair Focus**: Instantly fly the map to any captured entry.
   - **Data Purging**: One-click removal of individual entries.

4. **Multi-Layer Support**
   - Seamlessly toggle between **STREET**, **SATELLITE**, and **DARK** map layers.

5. **Export Capabilities**
   - **GPX**: Industry-standard format for GPS devices and tracking.
   - **GeoJSON**: Native format for professional GIS software (QGIS, ArcGIS).

---

## 🔒 Privacy Protocol

Field Collector is built on a "local-first" principle:
- **Zero Tracking**: Your location data never leaves your device unless you manually export it.
- **No Cloud**: There is no back-end database; everything is stored in browser-local memory/storage.
- **Offline Ready**: Once loaded, the app works entirely without an internet connection for data capture and management.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [npm](https://www.npmjs.com/) (v9 or higher)

### Installation
```bash
git clone https://github.com/aborbala/field-app.git
cd field-app
npm install
```

### Development
Launch the local dev server with HMR:
```bash
npm run dev
```

### Testing
Run the Vitest suite:
```bash
npm run test
```

### Production Build
Generate a bundled, optimized `/dist` folder for deployment:
```bash
npm run build
```

---

## 📜 License & Credits

**Engineered with ❤️ by [commit&coffee]**

This project is released under the **MIT License**.  
Open-source module designed for field data excellence.  
© 2026 // [commit&coffee] // ALL_SYSTEMS_GO
