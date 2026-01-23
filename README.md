# StudyTrack Client (Frontend)

A bespoke, high-performance academic management interface. Hand-crafted with React 19 and Tailwind CSS v4 to provide a premium, focused studying environment.

## 🎨 Design Philosophy
StudyTrack is built on a "Deep Work" aesthetic, featuring:
- **Glassmorphism**: Elegant transparency and depth.
- **Focused UI**: Distraction-free layouts for tracking subjects.
- **Micro-interactions**: Fluid animations using Framer Motion.

## 🚀 Technology Stack
- **Core**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS v4 (Bespoke theme)
- **State/Data**: TanStack Query (React Query) v5
- **Icons**: Lucide React

## 🏗️ Folder Structure
- **`src/pages/`**: Main application views (Dashboard, Profile, CourseList).
- **`src/components/`**: Reusable UI elements (Modals, Custom Inputs).
- **`src/layouts/`**: Global wrappers (Sidebar, Protected Layout).
- **`src/hooks/`**: Custom logic (Authentication, API consumers).
- **`src/services/`**: API configuration using Axios.

## 🛠️ Getting Started

### 1. Prerequisites
- Node.js 20+
- Backend running at `localhost:8080`

### 2. Installation
```bash
npm install
```

### 3. Development
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

## 🌟 Key Features
- **Smart Dashboard**: Visual analytics on mastery and study hours.
- **Topic Management**: Granular tracking of subject progress.
- **Protected Routing**: Automatic redirection for non-auth sessions.
- **Reactive Profile**: Dynamic updates to academic statistics.
- **Notification Center**: Real-time alerts for upcoming exams.

## 📦 Production Build
To generate the optimized bundle:
```bash
npm run build
```
The output will be in the `dist/` directory.
