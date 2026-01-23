import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    Plus,
    BookOpen,
    Clock,
    CheckCircle2,
    AlertTriangle,
    ArrowUpRight,
    MoreVertical
} from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import AddCourseModal from '../components/AddCourseModal';
import api from '../services/api';

interface Course {
    id: string;
    course_name: string;
    course_code: string;
    exam_date: string;
    progress: number;
    total_hours: number;
    topic_count: number;
    completed_topics: number;
    is_neglected: boolean;
}

const StatCard: React.FC<{ label: string; value: string | number; icon: React.ElementType; color: string; delay?: number }> = ({ label, value, icon: Icon, color, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay, duration: 0.5 }}
        className="p-6 rounded-3xl glass-card relative overflow-hidden group"
    >
        <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-10 transition-opacity group-hover:opacity-20 ${color}`} />
        <div className="flex items-start justify-between">
            <div className="space-y-2">
                <p className="text-sm font-medium text-surface-500">{label}</p>
                <h3 className="text-3xl font-display font-bold tracking-tight">{value}</h3>
            </div>
            <div className={`p-3 rounded-2xl ${color.replace('bg-', 'bg-')}/10 border border-white/5`}>
                <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
            </div>
        </div>
    </motion.div>
);

const CourseCard: React.FC<{ course: Course; delay?: number }> = ({ course, delay = 0 }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay, duration: 0.5 }}
        className="group h-full"
    >
        <Link to={`/courses/${course.id}`} className="block h-full p-6 rounded-3xl glass-card hover:border-brand-indigo/30 transition-all duration-300">
            <div className="flex items-start justify-between mb-6">
                <div className="space-y-1">
                    <h4 className="text-xl font-display font-semibold group-hover:text-brand-indigo transition-colors">{course.course_name}</h4>
                    <p className="text-sm font-medium text-surface-500 uppercase tracking-wider">{course.course_code}</p>
                </div>
                <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-surface-500" onClick={(e) => e.preventDefault()}>
                    <MoreVertical className="w-5 h-5" />
                </button>
            </div>

            <div className="mt-auto space-y-6">
                <div className="space-y-2">
                    <div className="flex justify-between items-end">
                        <p className="text-xs font-medium text-surface-400">Progress</p>
                        <p className="text-sm font-display font-bold text-brand-indigo">{Math.round(course.progress)}%</p>
                    </div>
                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${course.progress}%` }}
                            transition={{ duration: 1, delay: delay + 0.3 }}
                            className="h-full bg-brand-indigo rounded-full shadow-[0_0_12px_rgba(99,102,241,0.4)]"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-surface-500" />
                        <span className="text-xs text-surface-400">
                            {new Date(course.exam_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                    </div>
                    {course.is_neglected && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                            <AlertTriangle className="w-3 h-3 text-amber-500" />
                            <span className="text-[10px] font-bold text-amber-500 uppercase tracking-tighter">Neglected</span>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    </motion.div>
);

const Dashboard: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { data: courses, isLoading } = useQuery<Course[]>({
        queryKey: ['courses'],
        queryFn: () => api.get('/courses'),
    });

    const totalHours = courses?.reduce((acc, c) => acc + (c.total_hours || 0), 0) || 0;

    const stats = [
        { label: 'Active Courses', value: courses?.length || 0, icon: BookOpen, color: 'bg-brand-indigo', delay: 0.1 },
        { label: 'Completion Rate', value: `${Math.round((courses?.reduce((acc, c) => acc + c.progress, 0) || 0) / (courses?.length || 1))}%`, icon: CheckCircle2, color: 'bg-brand-emerald', delay: 0.2 },
        { label: 'Study Time', value: `${totalHours}h`, icon: Clock, color: 'bg-brand-amber', delay: 0.3 },
    ];

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-32 rounded-3xl bg-white/5 animate-pulse" />
                    ))}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-64 rounded-3xl bg-white/5 animate-pulse" />
                    ))}
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <AddCourseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

            <div className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-3xl font-display font-bold tracking-tight">Academic Overview</h1>
                    <p className="text-surface-500">Track your performance across all subjects</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-brand-indigo text-white rounded-2xl font-medium hover:bg-brand-indigo/90 active:scale-95 transition-all shadow-lg shadow-brand-indigo/20"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add Course</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {stats.map((stat) => (
                    <StatCard key={stat.label} {...stat} />
                ))}
            </div>

            {/* Quick Start Guide */}
            {(!courses || courses.length === 0) && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 p-8 rounded-[40px] bg-gradient-to-br from-brand-indigo/20 to-brand-emerald/20 border border-white/5 relative overflow-hidden"
                >
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                        <div className="flex-1 space-y-4 text-center md:text-left">
                            <h2 className="text-2xl font-display font-bold">Welcome to StudyTrack! 🚀</h2>
                            <p className="text-surface-400 leading-relaxed">Let's get you set up for a successful semester. Follow these 3 simple steps to start mastering your content.</p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
                                {[
                                    { step: '1', title: 'Add Course', desc: 'Create your subjects' },
                                    { step: '2', title: 'List Topics', desc: 'Break them down' },
                                    { step: '3', title: 'Log Hours', desc: 'Track your work' }
                                ].map((s) => (
                                    <div key={s.step} className="p-4 rounded-2xl bg-white/5 border border-white/10">
                                        <div className="w-8 h-8 rounded-lg bg-brand-indigo flex items-center justify-center text-xs font-bold mb-3">{s.step}</div>
                                        <h4 className="font-bold text-sm mb-1">{s.title}</h4>
                                        <p className="text-xs text-surface-500">{s.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="w-full md:w-auto">
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="w-full md:w-auto px-8 py-4 bg-brand-indigo text-white rounded-2xl font-bold hover:bg-brand-indigo/90 active:scale-95 transition-all shadow-xl shadow-brand-indigo/20 flex items-center justify-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                Start Now
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-display font-semibold">My Courses</h2>
                    <button className="text-sm font-medium text-brand-indigo flex items-center gap-1 hover:gap-2 transition-all">
                        See analytics <ArrowUpRight className="w-4 h-4" />
                    </button>
                </div>

                {courses && courses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {courses.map((course, index) => (
                            <CourseCard key={course.id} course={course} delay={index * 0.1} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 px-8 rounded-3xl border-2 border-dashed border-white/5 text-center">
                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mb-6">
                            <BookOpen className="w-8 h-8 text-surface-500" />
                        </div>
                        <h3 className="text-xl font-display font-semibold mb-2">No Courses Found</h3>
                        <p className="text-surface-500 max-w-sm mb-8">You haven't added any courses yet. Start your study journey by adding your first subject.</p>
                        <button className="btn-primary">
                            Add Your First Course
                        </button>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default Dashboard;
