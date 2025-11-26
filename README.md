# 🎲 Rubik's Cube Solver

A modern, interactive web application that helps you solve your Rubik's Cube using your webcam. Built with React, TypeScript, and advanced computer vision.

## ✨ Features

- 🎥 **Webcam Scanning** - Capture your cube's state using your device's camera
- 🎯 **Interactive 3D Model** - Drag and rotate a fully interactive 3D cube visualization
- 🧠 **Smart Solving Algorithm** - Uses the min2phase algorithm for optimal solutions
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile devices
- 🎨 **Modern UI** - Beautiful dark mode interface with smooth animations
- ✏️ **Manual Editing** - Click to manually correct any sticker colors
- 🚀 **Step-by-Step Guide** - Follow along with animated solution steps

## 🌐 Live Demo

Visit the live app: **[https://izaquielcordeiro.github.io/rubix-cube-solver/](https://izaquielcordeiro.github.io/rubix-cube-solver/)**

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- A webcam (for scanning feature)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/IzaquielCordeiro/rubix-cube-solver.git
   cd rubix-cube-solver
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:3000`

## 📖 How to Use

1. **Welcome Screen** - Click "Start" to begin
2. **Scan Your Cube** - Follow the on-screen instructions to scan all 6 faces
3. **Review & Edit** - Check the 3D preview and make any corrections
4. **Solve** - Click "Solve Cube" to generate the solution
5. **Follow Steps** - Use the interactive playback controls to solve your cube

## 🛠️ Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **3D Visualization**: Custom CSS 3D transforms
- **Solver Algorithm**: min2phase (Kociemba's algorithm)
- **Camera**: MediaStream Web API
- **Deployment**: GitHub Pages

## 📦 Build for Production

```bash
npm run build
```

The optimized production build will be in the `dist` folder.

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 📄 License

This project is open source and available under the MIT License.

## 👤 Author

**Izaquiel Cordeiro**
- GitHub: [@IzaquielCordeiro](https://github.com/IzaquielCordeiro)

---

Made with ❤️ and lots of cube twisting
