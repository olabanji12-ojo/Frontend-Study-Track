import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    User,
    LogOut,
    Menu,
    X,
    BookOpen,
    Settings,
    Bell,
    AlertTriangle,
    Clock
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

interface Course {
    id: string;
    course_name: string;
    course_code: string;
    exam_date: string;
    is_neglected: boolean;
    progress: number;
}

interface NavItemProps {
    to: string;
    icon: React.ElementType;
    label: string;
    active: boolean;
    onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon: Icon, label, active, onClick }) => (
    <Link to={to} onClick={onClick}>
        <motion.div
            whileHover={{ x: 4 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${active
                ? 'bg-brand-indigo/10 text-brand-indigo'
                : 'text-surface-400 hover:text-white hover:bg-white/5'
                }`}
        >
            <Icon className={`w-5 h-5 transition-colors ${active ? 'text-brand-indigo' : 'group-hover:text-white'}`} />
            <span className="font-medium">{label}</span>
            {active && (
                <motion.div
                    layoutId="nav-pill"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-indigo shadow-[0_0_8px_rgba(99,102,241,0.6)]"
                />
            )}
        </motion.div>
    </Link>
);

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, logout } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const location = useLocation();

    const navItems = [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/courses', icon: BookOpen, label: 'My Courses' },
        { to: '/profile', icon: User, label: 'Profile' },
        { to: '/settings', icon: Settings, label: 'Settings' },
    ];

    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

    const { data: courses } = useQuery<Course[]>({
        queryKey: ['courses'],
        queryFn: () => api.get('/courses'),
    });

    const notifications = React.useMemo(() => {
        if (!courses) return [];

        const generated: any[] = [];
        const now = new Date();

        courses.forEach(course => {
            const examDate = new Date(course.exam_date);
            const daysUntil = Math.ceil((examDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

            // Exam Reminder (within 7 days)
            if (daysUntil > 0 && daysUntil <= 7) {
                generated.push({
                    id: `exam-${course.id}`,
                    title: 'Exam Coming Up',
                    desc: `${course.course_name} (${course.course_code}) exam in ${daysUntil} day${daysUntil === 1 ? '' : 's'}`,
                    time: 'Now',
                    urgent: true,
                    icon: Bell
                });
            }

            // Neglect Warning
            if (course.is_neglected) {
                generated.push({
                    id: `neglect-${course.id}`,
                    title: 'Neglected Course',
                    desc: `You haven't studied ${course.course_code} in over 7 days. Time to catch up!`,
                    time: '1d ago',
                    urgent: false,
                    icon: AlertTriangle
                });
            }

            // Low Progress Warning (for exams within 14 days and < 30% progress)
            if (daysUntil > 0 && daysUntil <= 14 && course.progress < 30) {
                generated.push({
                    id: `progress-${course.id}`,
                    title: 'Urgent Review',
                    desc: `Exam soon for ${course.course_code} but progress is low. Focus on this today!`,
                    time: 'Just now',
                    urgent: true,
                    icon: Clock
                });
            }
        });

        return generated;
    }, [courses]);

    return (
        <div className="min-h-screen bg-brand-navy text-white flex">
            {/* Sidebar remains same... */}

            {/* Notification Drawer Overlay */}
            <AnimatePresence>
                {isNotificationsOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsNotificationsOpen(false)}
                            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
                        />
                        <motion.aside
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 right-0 bottom-0 z-[70] w-96 bg-brand-navy border-l border-white/5 p-8 flex flex-col space-y-8 shadow-2xl"
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-display font-bold">Notifications</h3>
                                <button onClick={() => setIsNotificationsOpen(false)} className="p-2 rounded-xl bg-white/5 hover:bg-white/10">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                                {notifications.length > 0 ? (
                                    notifications.map((n) => (
                                        <div key={n.id} className={`p-4 rounded-2xl border transition-all ${n.urgent ? 'bg-brand-indigo/5 border-brand-indigo/20' : 'bg-white/[0.02] border-white/5'}`}>
                                            <div className="flex justify-between items-start mb-1">
                                                <div className="flex items-center gap-2">
                                                    {n.icon && <n.icon className={`w-3.5 h-3.5 ${n.urgent ? 'text-brand-indigo' : 'text-surface-500'}`} />}
                                                    <h4 className="font-bold text-sm tracking-tight">{n.title}</h4>
                                                </div>
                                                <span className="text-[10px] text-surface-500 font-medium uppercase">{n.time}</span>
                                            </div>
                                            <p className="text-xs text-surface-400 leading-relaxed">{n.desc}</p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-20 px-8 rounded-3xl border-2 border-dashed border-white/5">
                                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                            <Bell className="w-6 h-6 text-surface-700" />
                                        </div>
                                        <p className="text-sm font-medium text-surface-500">No notifications yet</p>
                                        <p className="text-xs text-surface-600 mt-1">We'll alert you about upcoming exams</p>
                                    </div>
                                )}
                            </div>

                            <button className="w-full py-4 rounded-2xl bg-white/5 border border-white/5 text-sm font-medium hover:bg-white/10 transition-all">
                                Mark all as read
                            </button>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Sidebar - Desktop */}
            <aside className="hidden lg:flex flex-col w-72 border-r border-white/5 p-6 space-y-8">
                <div className="flex items-center gap-3 px-2">
                    <img src="/logo.png" alt="StudyTrack Logo" className="w-10 h-10 rounded-xl" />
                    <span className="text-xl font-display font-bold tracking-tight">StudyTrack</span>
                </div>

                <nav className="flex-1 space-y-1">
                    {navItems.map((item) => (
                        <NavItem
                            key={item.label}
                            {...item}
                            active={item.to === '/dashboard' ? location.pathname === item.to : location.pathname.startsWith(item.to)}
                        />
                    ))}
                </nav>

                <div className="pt-6 border-t border-white/5 space-y-4">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-10 h-10 rounded-full bg-surface-800 border border-white/10 flex items-center justify-center overflow-hidden">
                            <User className="w-6 h-6 text-surface-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user?.name}</p>
                            <p className="text-xs text-surface-500 truncate">{user?.email}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-surface-400 hover:text-rose-400 hover:bg-rose-400/5 transition-all duration-200 group"
                    >
                        <LogOut className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                        <span className="font-medium">Sign Out</span>
                    </button>
                </div>
            </aside>

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-brand-navy/80 backdrop-blur-lg border-b border-white/5 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-lg" />
                    <span className="text-lg font-display font-bold">StudyTrack</span>
                </div>
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10"
                >
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsSidebarOpen(false)}
                            className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="lg:hidden fixed top-0 left-0 bottom-0 z-50 w-80 bg-brand-navy border-r border-white/5 p-6 flex flex-col space-y-8 shadow-2xl"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-xl" />
                                    <span className="text-xl font-display font-bold">StudyTrack</span>
                                </div>
                                <button
                                    onClick={() => setIsSidebarOpen(false)}
                                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <nav className="flex-1 space-y-1">
                                {navItems.map((item) => (
                                    <NavItem
                                        key={item.label}
                                        {...item}
                                        active={item.to === '/dashboard' ? location.pathname === item.to : location.pathname.startsWith(item.to)}
                                        onClick={() => setIsSidebarOpen(false)}
                                    />
                                ))}
                            </nav>

                            <div className="pt-6 border-t border-white/5 space-y-4">
                                <div className="flex items-center gap-3 px-2">
                                    <div className="w-10 h-10 rounded-full bg-surface-800 border border-white/10 flex items-center justify-center overflow-hidden">
                                        <User className="w-6 h-6 text-surface-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">{user?.name}</p>
                                        <p className="text-xs text-surface-500 truncate">{user?.email}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={logout}
                                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-surface-400 hover:text-rose-400 hover:bg-rose-400/5 transition-all duration-200"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span className="font-medium">Sign Out</span>
                                </button>
                            </div>
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>

            {/* Main Content */}
            <main className="flex-1 lg:ml-0 pt-20 lg:pt-0 overflow-x-hidden">
                <header className="hidden lg:flex items-center justify-between px-10 py-6">
                    <div>
                        <h2 className="text-sm font-medium text-surface-500 uppercase tracking-widest px-1">Welcome back</h2>
                        <p className="text-2xl font-display font-medium">{user?.name} 👋</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsNotificationsOpen(true)}
                            className="p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 relative transition-colors"
                        >
                            <Bell className="w-5 h-5 text-surface-400" />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-brand-indigo rounded-full ring-4 ring-brand-navy" />
                        </button>
                    </div>
                </header>
                <div className="px-6 lg:px-10 pb-12">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
