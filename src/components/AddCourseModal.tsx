import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Book, Hash, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

const courseSchema = z.object({
    course_name: z.string().min(2, 'Course name must be at least 2 characters'),
    course_code: z.string().min(2, 'Course code is required'),
    exam_date: z.string().min(1, 'Exam date is required'),
});

type CourseForm = z.infer<typeof courseSchema>;

interface AddCourseModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const AddCourseModal: React.FC<AddCourseModalProps> = ({ isOpen, onClose }) => {
    const queryClient = useQueryClient();
    const [error, setError] = useState<string | null>(null);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<CourseForm>({
        resolver: zodResolver(courseSchema),
    });

    const mutation = useMutation({
        mutationFn: (data: CourseForm) => api.post('/courses', {
            ...data,
            exam_date: new Date(data.exam_date).toISOString()
        }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses'] });
            reset();
            onClose();
        },
        onError: (err: any) => {
            setError(err.message);
        },
    });

    const onSubmit = (data: CourseForm) => {
        setError(null);
        mutation.mutate(data);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg bg-surface-950 border border-white/10 rounded-[32px] shadow-2xl overflow-hidden"
                    >
                        <div className="p-8 border-b border-white/5 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-display font-bold">Add New Course</h2>
                                <p className="text-surface-500 text-sm">Fill in the details to start tracking</p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-surface-400 transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
                            {error && (
                                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-surface-400 ml-1">Course Name</label>
                                <div className="relative group">
                                    <Book className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500 group-focus-within:text-brand-indigo transition-colors" />
                                    <input
                                        {...register('course_name')}
                                        placeholder="e.g. Advanced Mathematics"
                                        className="input-field pl-12"
                                    />
                                </div>
                                {errors.course_name && <p className="text-xs text-rose-400 ml-1">{errors.course_name.message}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-surface-400 ml-1">Course Code</label>
                                    <div className="relative group">
                                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500 group-focus-within:text-brand-indigo transition-colors" />
                                        <input
                                            {...register('course_code')}
                                            placeholder="MATH201"
                                            className="input-field pl-12"
                                        />
                                    </div>
                                    {errors.course_code && <p className="text-xs text-rose-400 ml-1">{errors.course_code.message}</p>}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-surface-400 ml-1">Exam Date</label>
                                    <div className="relative group">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500 group-focus-within:text-brand-indigo transition-colors" />
                                        <input
                                            {...register('exam_date')}
                                            type="date"
                                            className="input-field pl-12"
                                        />
                                    </div>
                                    {errors.exam_date && <p className="text-xs text-rose-400 ml-1">{errors.exam_date.message}</p>}
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="flex-1 px-6 py-3 rounded-xl border border-white/10 font-medium hover:bg-white/5 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    disabled={mutation.isPending}
                                    type="submit"
                                    className="flex-2 px-10 py-3 bg-brand-indigo text-white rounded-xl font-medium hover:bg-brand-indigo/90 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {mutation.isPending ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        'Add Course'
                                    )}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AddCourseModal;
