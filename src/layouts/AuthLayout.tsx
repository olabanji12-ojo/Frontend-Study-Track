import React from 'react';
import { motion } from 'framer-motion';

interface AuthLayoutProps {
    children: React.ReactNode;
    title: string;
    subtitle: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
    return (
        <div className="min-h-screen grid lg:grid-cols-2 bg-brand-navy overflow-hidden">
            {/* Visual Side (Hidden on Mobile) */}
            <div className="hidden lg:flex relative items-center justify-center p-12 overflow-hidden bg-gradient-to-br from-brand-navy via-brand-navy to-brand-indigo/20">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-brand-indigo/10 blur-[120px] rounded-full" />
                    <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-brand-emerald/10 blur-[120px] rounded-full" />
                </div>

                <div className="relative z-10 max-w-md text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                        className="mb-8 inline-block p-4 rounded-3xl glass-card"
                    >
                        <div className="w-16 h-16 bg-brand-indigo rounded-2xl flex items-center justify-center shadow-xl shadow-brand-indigo/40 font-display text-3xl text-white italic">
                            ST
                        </div>
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="text-4xl font-display font-bold text-white mb-4 tracking-tight"
                    >
                        Elevate Your Study Game
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                        className="text-surface-400 text-lg leading-relaxed"
                    >
                        Track your progress, manage your courses, and dominate your exams with professional tools.
                    </motion.p>
                </div>
            </div>

            {/* Form Side */}
            <div className="flex flex-col items-center justify-center p-6 lg:p-12 relative">
                {/* Mobile Background Blob */}
                <div className="lg:hidden absolute inset-0 overflow-hidden pointer-events-none -z-10">
                    <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[80%] bg-brand-indigo/10 blur-[80px] rounded-full" />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                >
                    <div className="text-center lg:text-left mb-10">
                        <h2 className="text-3xl font-display font-bold text-white mb-2">{title}</h2>
                        <p className="text-surface-400">{subtitle}</p>
                    </div>

                    <div className="p-8 rounded-3xl glass-card backdrop-blur-2xl bg-white/[0.03]">
                        {children}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AuthLayout;
