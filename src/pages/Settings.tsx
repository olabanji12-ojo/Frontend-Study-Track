import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Bell, Trash2, ArrowLeft, LogOut, AlertCircle, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

const SettingsPage: React.FC = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    // Toggle States
    const [privacySettings, setPrivacySettings] = useState([
        { id: 'public_profile', title: 'Public Profile', desc: 'Allow others to see your study stats', active: false },
        { id: 'activity_insights', title: 'Activity Insights', desc: 'Share usage data to improve StudyTrack', active: true },
    ]);

    const [notificationSettings, setNotificationSettings] = useState([
        { id: 'exam_reminders', title: 'Exam Reminders', desc: 'Notify me 7 days before an exam', active: true },
        { id: 'study_sprints', title: 'Study Sprints', desc: 'Alert me to start my daily sessions', active: true },
    ]);

    const toggleSetting = (id: string, group: 'privacy' | 'notifications') => {
        if (group === 'privacy') {
            setPrivacySettings(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
        } else {
            setNotificationSettings(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
        }
    };

    const deleteMutation = useMutation({
        mutationFn: () => api.delete('/users/me'),
        onSuccess: () => {
            logout();
            navigate('/login');
        },
    });

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <Link to="/profile" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-surface-400" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-display font-bold tracking-tight">System Settings</h1>
                        <p className="text-surface-500 text-sm">Configure your StudyTrack workspace</p>
                    </div>
                </div>

                <div className="space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-8 rounded-[32px] glass-card space-y-8"
                    >
                        <section className="space-y-6">
                            <h3 className="text-lg font-display font-bold flex items-center gap-2">
                                <Shield className="w-5 h-5 text-brand-indigo" />
                                Privacy & Security
                            </h3>
                            <div className="space-y-4">
                                {privacySettings.map((s) => (
                                    <div
                                        key={s.id}
                                        className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors"
                                        onClick={() => toggleSetting(s.id, 'privacy')}
                                    >
                                        <div>
                                            <h4 className="font-bold text-sm text-white">{s.title}</h4>
                                            <p className="text-xs text-surface-500">{s.desc}</p>
                                        </div>
                                        <div className={`w-12 h-6 rounded-full transition-all relative cursor-pointer ${s.active ? 'bg-brand-indigo' : 'bg-surface-800'}`}>
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${s.active ? 'left-7' : 'left-1'}`} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <section className="space-y-6">
                            <h3 className="text-lg font-display font-bold flex items-center gap-2">
                                <Bell className="w-5 h-5 text-brand-emerald" />
                                Notifications
                            </h3>
                            <div className="space-y-4">
                                {notificationSettings.map((s) => (
                                    <div
                                        key={s.id}
                                        className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors"
                                        onClick={() => toggleSetting(s.id, 'notifications')}
                                    >
                                        <div>
                                            <h4 className="font-bold text-sm text-white">{s.title}</h4>
                                            <p className="text-xs text-surface-500">{s.desc}</p>
                                        </div>
                                        <div className={`w-12 h-6 rounded-full transition-all relative cursor-pointer ${s.active ? 'bg-brand-emerald' : 'bg-surface-800'}`}>
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${s.active ? 'left-7' : 'left-1'}`} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row gap-4 justify-between">
                            <button className="flex items-center gap-2 text-surface-500 hover:text-white transition-colors font-medium text-sm">
                                <Trash2 className="w-4 h-4" />
                                Clear cache and local data
                            </button>

                            <button
                                onClick={() => setIsDeleteModalOpen(true)}
                                className="flex items-center gap-2 text-rose-400 hover:text-rose-500 transition-colors font-medium text-sm px-4 py-2 rounded-xl bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10"
                            >
                                <LogOut className="w-4 h-4" />
                                Delete Account
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <AnimatePresence>
                {isDeleteModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsDeleteModalOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md bg-surface-950 border border-white/10 rounded-[32px] shadow-2xl p-8 space-y-6"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center mx-auto">
                                <AlertCircle className="w-8 h-8 text-rose-500" />
                            </div>

                            <div className="text-center space-y-2">
                                <h3 className="text-2xl font-display font-bold">Delete Account?</h3>
                                <p className="text-surface-500 text-sm leading-relaxed">
                                    This action is permanent and will delete all your courses, topics, and study data.
                                </p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setIsDeleteModalOpen(false)}
                                    className="flex-1 px-6 py-3 rounded-xl border border-white/10 font-medium hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    disabled={deleteMutation.isPending}
                                    onClick={() => deleteMutation.mutate()}
                                    className="flex-1 px-6 py-3 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {deleteMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Yes, Delete'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </DashboardLayout>
    );
};

export default SettingsPage;
