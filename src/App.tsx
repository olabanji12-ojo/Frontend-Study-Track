import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CourseDetails from './pages/CourseDetails';
import ProfileHub from './pages/ProfileHub';
import Landing from './pages/Landing';
import CourseList from './pages/CourseList';
import SettingsPage from './pages/Settings';

function App() {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-brand-navy text-white">
                <div className="animate-pulse font-display text-2xl">StudyTrack</div>
            </div>
        );
    }

    return (
        <Router>
            <Routes>
                <Route
                    path="/login"
                    element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />}
                />
                <Route
                    path="/register"
                    element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />}
                />
                <Route
                    path="/dashboard"
                    element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />}
                />
                <Route
                    path="/courses/:courseId"
                    element={isAuthenticated ? <CourseDetails /> : <Navigate to="/login" />}
                />
                <Route
                    path="/courses"
                    element={isAuthenticated ? <CourseList /> : <Navigate to="/login" />}
                />
                <Route
                    path="/settings"
                    element={isAuthenticated ? <SettingsPage /> : <Navigate to="/login" />}
                />
                <Route
                    path="/profile"
                    element={isAuthenticated ? <ProfileHub /> : <Navigate to="/login" />}
                />
                <Route path="/" element={!isAuthenticated ? <Landing /> : <Navigate to="/dashboard" />} />
                <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} />} />
            </Routes>
        </Router>
    );
}

export default App;
