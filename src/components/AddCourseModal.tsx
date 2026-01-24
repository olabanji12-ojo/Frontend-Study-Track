import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Book, Hash, Loader2, Trash2 } from 'lucide-react';
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
    const [isBulk, setIsBulk] = useState(false);

    // Dynamic Rows State
    const [bulkRows, setBulkRows] = useState<Array<{ name: string; code: string; date: string }>>([
        { name: '', code: '', date: '' }
    ]);

    const { register, handleSubmit, reset, formState: { errors } } = useForm<CourseForm>({
        resolver: zodResolver(courseSchema),
    });

    const mutation = useMutation({
        mutationFn: (data: CourseForm | { courses: any[] }) => {
            if ('courses' in data) {
                return api.post('/courses/bulk', data.courses);
            }
            return api.post('/courses', {
                ...data,
                exam_date: new Date(data.exam_date).toISOString()
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['courses'] });
            reset();
            setBulkRows([{ name: '', code: '', date: '' }]);
            setIsBulk(false);
            onClose();
        },
        onError: (err: any) => {
            setError(err.message);
        },
    });

    const updateRow = (index: number, field: keyof typeof bulkRows[0], value: string) => {
        const newRows = [...bulkRows];
        newRows[index][field] = value;
        setBulkRows(newRows);

        // Auto-add new row if the last row is being typed into
        if (index === bulkRows.length - 1 && value.trim() !== '') {
            setBulkRows([...newRows, { name: '', code: '', date: '' }]);
        }
    };

    const removeRow = (index: number) => {
        if (bulkRows.length > 1) {
            setBulkRows(bulkTopics => bulkTopics.filter((_, i) => i !== index));
        }
    };

    const onSubmit = (data: CourseForm) => {
        setError(null);
        if (isBulk) {
            const validRows = bulkRows.filter(row => row.name.trim() !== '' && row.code.trim() !== '' && row.date !== '');
            if (validRows.length === 0) {
                setError('Please fill in at least one complete course row (Name, Code, and Date)');
                return;
            }
            const courses = validRows.map(row => ({
                course_name: row.name,
                course_code: row.code,
                exam_date: new Date(row.date).toISOString()
            }));
            mutation.mutate({ courses });
        } else {
            mutation.mutate(data);
        }
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
                        className="relative w-full max-w-2xl bg-surface-950 border border-white/10 rounded-[32px] shadow-2xl overflow-hidden"
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

                        <form
                            onSubmit={isBulk ? (e) => { e.preventDefault(); onSubmit({} as any); } : handleSubmit(onSubmit)}
                            className="p-8 space-y-6"
                        >
                            {error && (
                                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
                                    {error}
                                </div>
                            )}

                            <div className="flex items-center justify-between p-1 bg-white/5 rounded-xl">
                                <button
                                    type="button"
                                    onClick={() => setIsBulk(false)}
                                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${!isBulk ? 'bg-brand-indigo text-white shadow-lg' : 'text-surface-500 hover:text-surface-300'}`}
                                >
                                    Single Course
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsBulk(true)}
                                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${isBulk ? 'bg-brand-indigo text-white shadow-lg' : 'text-surface-500 hover:text-surface-300'}`}
                                >
                                    Bulk Add
                                </button>
                            </div>

                            {!isBulk ? (
                                <div className="space-y-6">
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
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="flex text-[10px] font-bold text-surface-500 uppercase tracking-widest px-1">
                                        <span className="flex-[3] ml-1">Course Name</span>
                                        <span className="flex-1 ml-4">Code</span>
                                        <span className="flex-[2] ml-4">Exam Date</span>
                                        <span className="w-8 ml-4"></span>
                                    </div>
                                    <div className="space-y-3 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
                                        {bulkRows.map((row, index) => (
                                            <motion.div
                                                initial={{ x: -10, opacity: 0 }}
                                                animate={{ x: 0, opacity: 1 }}
                                                key={index}
                                                className="flex items-center gap-3"
                                            >
                                                <div className="flex-[3]">
                                                    <input
                                                        value={row.name}
                                                        onChange={(e) => updateRow(index, 'name', e.target.value)}
                                                        placeholder="Name"
                                                        className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-xl focus:border-brand-indigo/50 outline-none transition-all text-sm"
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <input
                                                        value={row.code}
                                                        onChange={(e) => updateRow(index, 'code', e.target.value)}
                                                        placeholder="Code"
                                                        className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-xl focus:border-brand-indigo/50 outline-none transition-all text-sm uppercase"
                                                    />
                                                </div>
                                                <div className="flex-[2]">
                                                    <input
                                                        type="date"
                                                        value={row.date}
                                                        onChange={(e) => updateRow(index, 'date', e.target.value)}
                                                        className="w-full h-10 px-3 bg-white/5 border border-white/10 rounded-xl focus:border-brand-indigo/50 outline-none transition-all text-sm"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeRow(index)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-rose-500/10 text-surface-600 hover:text-rose-500 transition-colors"
                                                    disabled={bulkRows.length === 1}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </div>
                                    <p className="text-[10px] text-surface-600 mt-2 italic">* A new row appears automatically when you type in the last row.</p>
                                </div>
                            )}

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
                                        isBulk ? 'Add Courses' : 'Add Course'
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
