import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
    BookOpen,
    CheckCircle2,
    ArrowRight,
    Zap,
    Layers
} from 'lucide-react';

const Landing: React.FC = () => {
    const { isAuthenticated, logout } = useAuth();

    return (
        <div className="min-h-screen bg-brand-navy text-white selection:bg-brand-indigo/30 overflow-x-hidden">
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-brand-navy/80 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Logo" className="w-10 h-10 rounded-xl" />
                        <span className="text-xl font-display font-bold tracking-tight">StudyTrack</span>
                    </div>
                    <div className="flex items-center gap-4">
                        {isAuthenticated ? (
                            <>
                                <Link to="/dashboard" className="text-sm font-medium text-surface-400 hover:text-white transition-colors">Dashboard</Link>
                                <button
                                    onClick={logout}
                                    className="px-5 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl font-medium hover:bg-white/10 transition-all shadow-lg shadow-black/10"
                                >
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-sm font-medium text-surface-400 hover:text-white transition-colors">Sign In</Link>
                                <Link to="/register" className="px-5 py-2.5 bg-brand-indigo text-white rounded-xl font-medium hover:bg-brand-indigo/90 transition-all shadow-lg shadow-brand-indigo/20">
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-40 pb-20 px-6">
                <div className="absolute inset-0 z-0 pointer-events-none">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-brand-indigo/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-brand-emerald/10 blur-[120px] rounded-full translate-y-1/2 -translate-x-1/2" />
                </div>

                <div className="max-w-5xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-brand-indigo uppercase tracking-widest mb-8">
                            <Zap className="w-3 h-3 fill-current" />
                            Elevate your academic performance
                        </span>
                        <h1 className="text-6xl md:text-8xl font-display font-bold tracking-tight mb-8">
                            Master your studies with <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-indigo to-brand-emerald">Precision.</span>
                        </h1>
                        <p className="text-xl text-surface-400 max-w-2xl mx-auto mb-12 leading-relaxed">
                            StudyTrack is the bespoke companion for students who demand excellence. Track courses, manage topics, and visualize your progress with a hand-crafted interface.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Link to={isAuthenticated ? "/dashboard" : "/register"} className="w-full sm:w-auto px-10 py-4 bg-brand-indigo text-white rounded-2xl font-bold text-lg hover:bg-brand-indigo/90 active:scale-95 transition-all shadow-xl shadow-brand-indigo/20 flex items-center justify-center gap-3 group">
                                {isAuthenticated ? 'Go to Dashboard' : 'Start Tracking Now'}
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <a href="#features" className="w-full sm:w-auto px-10 py-4 bg-white/5 border border-white/10 rounded-2xl font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                                Learn more
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Grid */}
            <section id="features" className="py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-display font-bold mb-4">Focus on what matters</h2>
                        <p className="text-surface-500">Everything you need to stay on top of your semester.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { title: 'Course Mastery', desc: 'Organize your entire semester into manageable courses and codes.', icon: BookOpen },
                            { title: 'Topic Tracking', desc: 'Break down complex subjects into granular topics and track your hours.', icon: Layers },
                            { title: 'Goal Driven', desc: 'Set exam dates and watch your progress bars fill as you master content.', icon: CheckCircle2 },
                        ].map((f, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-8 rounded-[40px] glass-card hover:border-brand-indigo/30 transition-all group"
                            >
                                <div className="w-14 h-14 bg-brand-indigo/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                    <f.icon className="w-7 h-7 text-brand-indigo" />
                                </div>
                                <h3 className="text-2xl font-display font-bold mb-4">{f.title}</h3>
                                <p className="text-surface-500 leading-relaxed">{f.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-white/5">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="Logo" className="w-8 h-8 rounded-lg" />
                        <span className="text-lg font-display font-bold">StudyTrack</span>
                    </div>
                    <p className="text-surface-600 text-sm">© 2026 StudyTrack. Hand-crafted for excellence.</p>
                    <div className="flex gap-6">
                        {isAuthenticated ? (
                            <Link to="/dashboard" className="text-sm text-surface-500 hover:text-white transition-colors">Dashboard</Link>
                        ) : (
                            <>
                                <Link to="/login" className="text-sm text-surface-500 hover:text-white transition-colors">SignIn</Link>
                                <Link to="/register" className="text-sm text-surface-500 hover:text-white transition-colors">Register</Link>
                            </>
                        )}
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
