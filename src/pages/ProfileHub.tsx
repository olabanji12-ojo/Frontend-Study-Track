import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { User, Mail, Save, Loader2, CheckCircle, Shield } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../services/api';
import { useAuth } from '../hooks/useAuth';

const profileSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
});

type ProfileForm = z.infer<typeof profileSchema>;

const ProfileHub: React.FC = () => {
    const { user, login, token } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user?.name || '',
        }
    });

    const onSubmit = async (data: ProfileForm) => {
        setIsSubmitting(true);
        setError(null);
        setSuccess(false);
        try {
            const response = await api.put<any, any>('/users/me', data);
            // Our interceptor unwraps to updatedUser
            if (token) {
                login(token, response);
            }
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const { data: courses } = useQuery<any[]>({
        queryKey: ['courses'],
        queryFn: () => api.get('/courses'),
    });

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto">
                <div className="mb-10">
                    <h1 className="text-3xl font-display font-bold tracking-tight">Account Settings</h1>
                    <p className="text-surface-500">Manage your profile and account security</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-8 rounded-[32px] glass-card shadow-xl"
                        >
                            <h3 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
                                <User className="w-5 h-5 text-brand-indigo" />
                                Personal Information
                            </h3>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                {error && (
                                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                                        {error}
                                    </div>
                                )}

                                {success && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="p-4 rounded-xl bg-brand-emerald/10 border border-brand-emerald/20 text-brand-emerald text-sm flex items-center gap-2"
                                    >
                                        <CheckCircle className="w-5 h-5" />
                                        Profile updated successfully!
                                    </motion.div>
                                )}

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-surface-400 ml-1">Full Name</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500 group-focus-within:text-brand-indigo transition-colors" />
                                        <input
                                            {...register('name')}
                                            placeholder="Your name"
                                            className="input-field pl-12"
                                        />
                                    </div>
                                    {errors.name && <p className="text-xs text-rose-400 ml-1">{errors.name.message}</p>}
                                </div>

                                <div className="space-y-1.5 opacity-60">
                                    <label className="text-sm font-medium text-surface-400 ml-1">Email Address (Read-only)</label>
                                    <div className="relative">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500" />
                                        <input
                                            value={user?.email || ''}
                                            disabled
                                            className="input-field pl-12 bg-white/[0.02]"
                                        />
                                    </div>
                                    <p className="text-[10px] text-surface-500 ml-1 mt-1 flex items-center gap-1">
                                        <Shield className="w-3 h-3" /> Contact support to change email
                                    </p>
                                </div>

                                <div className="pt-4">
                                    <button
                                        disabled={isSubmitting}
                                        type="submit"
                                        className="btn-primary w-full md:w-auto px-10 flex items-center justify-center gap-2"
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                <Save className="w-5 h-5" />
                                                Save Changes
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="p-8 rounded-[32px] glass-card border-rose-500/10 bg-rose-500/[0.01]"
                        >
                            <h3 className="text-xl font-display font-semibold mb-2 text-rose-400">Danger Zone</h3>
                            <p className="text-sm text-surface-500 mb-6">Once you delete your account, there is no going back. Please be certain.</p>
                            <Link
                                to="/settings"
                                className="inline-block px-6 py-3 rounded-xl border border-rose-500/20 text-rose-400 font-medium hover:bg-rose-500/10 transition-colors"
                            >
                                Delete Account
                            </Link>
                        </motion.div>
                    </div>

                    <aside className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="p-8 rounded-[32px] glass-card text-center"
                        >
                            <div className="w-24 h-24 rounded-3xl bg-brand-indigo/10 border border-brand-indigo/20 flex items-center justify-center mx-auto mb-4 overflow-hidden shadow-2xl shadow-brand-indigo/10">
                                <span className="text-4xl font-display font-bold text-brand-indigo">
                                    {user?.name?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <h4 className="text-xl font-display font-bold">{user?.name}</h4>
                            <p className="text-sm text-surface-500 mb-6">Student since 2026</p>

                            <div className="grid grid-cols-2 gap-3">
                                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                                    <p className="text-xs text-surface-500 mb-1">Courses</p>
                                    <p className="text-xl font-display font-bold">
                                        {courses?.length || 0}
                                    </p>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/5">
                                    <p className="text-xs text-surface-500 mb-1">Rank</p>
                                    <p className="text-xl font-display font-bold text-brand-amber text-xs">Scholar</p>
                                </div>
                            </div>
                        </motion.div>
                    </aside>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ProfileHub;
