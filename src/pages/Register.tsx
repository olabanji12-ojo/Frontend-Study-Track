import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Loader2, AlertCircle } from 'lucide-react';
import AuthLayout from '../layouts/AuthLayout';
import api from '../services/api';

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

type RegisterForm = z.infer<typeof registerSchema>;

const Register: React.FC = () => {
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<RegisterForm>({
        resolver: zodResolver(registerSchema),
    });

    const onSubmit = async (data: RegisterForm) => {
        setIsSubmitting(true);
        setError(null);
        try {
            await api.post('/auth/register', data);
            navigate('/login', { state: { message: 'Account created! Please sign in.' } });
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
            title="Create Account"
            subtitle="Join StudyTrack to start tracking"
        >
            <motion.form
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                onSubmit={handleSubmit(onSubmit)}
                className="space-y-5"
            >
                {error && (
                    <motion.div
                        variants={itemVariants}
                        className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm flex items-start gap-3"
                    >
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <p>{error}</p>
                    </motion.div>
                )}

                <motion.div variants={itemVariants} className="space-y-1.5">
                    <label className="text-sm font-medium text-surface-400 ml-1">Full Name</label>
                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500 group-focus-within:text-brand-indigo transition-colors" />
                        <input
                            {...register('name')}
                            type="text"
                            placeholder="John Doe"
                            className="input-field pl-12"
                        />
                    </div>
                    {errors.name && <p className="text-xs text-rose-400 ml-1">{errors.name.message}</p>}
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-1.5">
                    <label className="text-sm font-medium text-surface-400 ml-1">Email</label>
                    <div className="relative group">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500 group-focus-within:text-brand-indigo transition-colors" />
                        <input
                            {...register('email')}
                            type="email"
                            placeholder="name@example.com"
                            className="input-field pl-12"
                        />
                    </div>
                    {errors.email && <p className="text-xs text-rose-400 ml-1">{errors.email.message}</p>}
                </motion.div>

                <motion.div variants={itemVariants} className="space-y-1.5">
                    <label className="text-sm font-medium text-surface-400 ml-1">Password</label>
                    <div className="relative group">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500 group-focus-within:text-brand-indigo transition-colors" />
                        <input
                            {...register('password')}
                            type="password"
                            placeholder="••••••••"
                            className="input-field pl-12"
                        />
                    </div>
                    {errors.password && <p className="text-xs text-rose-400 ml-1">{errors.password.message}</p>}
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
                        'Create Account'
                    )}
                </motion.button>

                <motion.p variants={itemVariants} className="text-center text-sm text-surface-400 pt-2">
                    Already have an account?{' '}
                    <Link to="/login" className="text-brand-indigo font-medium hover:underline decoration-brand-indigo/30 underline-offset-4">
                        Sign in
                    </Link>
                </motion.p>
            </motion.form>
        </AuthLayout>
    );
};

export default Register;
