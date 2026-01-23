import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Loader2, AlertCircle, CheckCircle2, Key, Eye, EyeOff } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import api from '../services/api';

const resetPasswordSchema = z.object({
    token: z.string().length(6, 'Code must be 6 digits'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

const ResetPassword: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const urlToken = queryParams.get('token') || '';

    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const email = location.state?.email || '';

    const { register, handleSubmit, formState: { errors } } = useForm<ResetPasswordForm>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            token: urlToken,
        }
    });

    const onSubmit = async (data: ResetPasswordForm) => {
        setIsSubmitting(true);
        setError(null);
        try {
            await api.post('/auth/reset-password', {
                token: data.token,
                newPassword: data.newPassword
            });
            setIsSuccess(true);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0 },
    };

    return (
        <AuthLayout
            title="Update Password"
            subtitle="Enter the code sent to your email"
        >
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
            >
                {isSuccess ? (
                    <motion.div
                        variants={itemVariants}
                        className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3"
                    >
                        <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                        </div>
                        <h3 className="text-emerald-400 font-medium text-lg">Password Updated</h3>
                        <p className="text-surface-400 text-sm">
                            Your password has been reset successfully. Redirecting to login...
                        </p>
                    </motion.div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                        {error && (
                            <motion.div
                                variants={itemVariants}
                                className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-start gap-3"
                            >
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <p>{error}</p>
                            </motion.div>
                        )}

                        {email && (
                            <motion.p variants={itemVariants} className="text-sm text-surface-400 text-center">
                                Code sent to <span className="text-brand-indigo font-medium">{email}</span>
                            </motion.p>
                        )}

                        <motion.div variants={itemVariants} className="space-y-1.5">
                            <label className="text-sm font-medium text-surface-400 ml-1">Reset Code</label>
                            <div className="relative group">
                                <Key className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500 group-focus-within:text-brand-indigo transition-colors" />
                                <input
                                    {...register('token')}
                                    type="text"
                                    placeholder="123456"
                                    maxLength={6}
                                    className="input-field pl-12 text-center tracking-[0.5em] font-mono font-bold text-lg"
                                />
                            </div>
                            {errors.token && <p className="text-xs text-rose-400 ml-1">{errors.token.message}</p>}
                        </motion.div>

                        <motion.div variants={itemVariants} className="space-y-1.5">
                            <label className="text-sm font-medium text-surface-400 ml-1">New Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500 group-focus-within:text-brand-indigo transition-colors" />
                                <input
                                    {...register('newPassword')}
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="input-field pl-12 pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-500 hover:text-surface-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.newPassword && <p className="text-xs text-rose-400 ml-1">{errors.newPassword.message}</p>}
                        </motion.div>

                        <motion.div variants={itemVariants} className="space-y-1.5">
                            <label className="text-sm font-medium text-surface-400 ml-1">Confirm New Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500 group-focus-within:text-brand-indigo transition-colors" />
                                <input
                                    {...register('confirmPassword')}
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    className="input-field pl-12 pr-12"
                                />
                            </div>
                            {errors.confirmPassword && <p className="text-xs text-rose-400 ml-1">{errors.confirmPassword.message}</p>}
                        </motion.div>

                        <motion.button
                            variants={itemVariants}
                            disabled={isSubmitting}
                            type="submit"
                            className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                'Reset Password'
                            )}
                        </motion.button>

                        <motion.div variants={itemVariants} className="text-center">
                            <Link to="/forgot-password" title="Forgot Password" className="text-xs text-surface-500 hover:text-brand-indigo transition-colors">Didn't get the code? Resend</Link>
                        </motion.div>
                    </form>
                )}
            </motion.div>
        </AuthLayout>
    );
};

export default ResetPassword;
