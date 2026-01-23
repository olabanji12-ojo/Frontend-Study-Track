import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, AlertCircle, CheckCircle2, Key, ArrowLeft } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import api from '../services/api';

const verifyEmailSchema = z.object({
    token: z.string().length(6, 'Code must be 6 digits'),
});

type VerifyEmailForm = z.infer<typeof verifyEmailSchema>;

const VerifyEmail: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [resending, setResending] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const email = location.state?.email || '';

    useEffect(() => {
        if (!email) {
            navigate('/login');
        }
    }, [email, navigate]);

    const { register, handleSubmit, formState: { errors } } = useForm<VerifyEmailForm>({
        resolver: zodResolver(verifyEmailSchema),
    });

    const onSubmit = async (data: VerifyEmailForm) => {
        setIsSubmitting(true);
        setError(null);
        try {
            await api.post('/auth/verify-email', {
                email,
                token: data.token
            });
            setIsSuccess(true);
            setTimeout(() => {
                navigate('/login', { state: { message: 'Email verified! You can now sign in.' } });
            }, 3000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        setError(null);
        try {
            await api.post('/auth/resend-verification', { email });
            // Success toast or message could go here
        } catch (err: any) {
            setError(err.message);
        } finally {
            setResending(false);
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
            title="Verify Email"
            subtitle="Enter the code sent to your inbox"
        >
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-6"
            >
                <motion.div variants={itemVariants}>
                    <Link to="/login" className="inline-flex items-center gap-2 text-sm text-surface-400 hover:text-brand-indigo transition-colors group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to Login
                    </Link>
                </motion.div>

                {isSuccess ? (
                    <motion.div
                        variants={itemVariants}
                        className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3"
                    >
                        <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                        </div>
                        <h3 className="text-emerald-400 font-medium text-lg">Verification Successful</h3>
                        <p className="text-surface-400 text-sm">
                            Your email has been verified. Redirecting to login...
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

                        <motion.p variants={itemVariants} className="text-sm text-surface-400 text-center">
                            We've sent a 6-digit code to <span className="text-brand-indigo font-medium">{email}</span>
                        </motion.p>

                        <motion.div variants={itemVariants} className="space-y-1.5">
                            <label className="text-sm font-medium text-surface-400 ml-1">Verification Code</label>
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

                        <motion.button
                            variants={itemVariants}
                            disabled={isSubmitting}
                            type="submit"
                            className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                'Verify Email'
                            )}
                        </motion.button>

                        <motion.div variants={itemVariants} className="text-center">
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={resending}
                                className="text-xs text-surface-500 hover:text-brand-indigo transition-colors disabled:opacity-50"
                            >
                                {resending ? 'Resending...' : "Didn't get the code? Resend"}
                            </button>
                        </motion.div>
                    </form>
                )}
            </motion.div>
        </AuthLayout>
    );
};

export default VerifyEmail;
