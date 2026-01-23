import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { BookOpen, Plus, Search, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
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
    is_neglected: boolean;
}

const CourseList: React.FC = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const { data: courses, isLoading } = useQuery<Course[]>({
        queryKey: ['courses'],
        queryFn: () => api.get('/courses'),
    });

    const filteredCourses = courses?.filter(c =>
        c.course_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.course_code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DashboardLayout>
            <AddCourseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />

            <div className="mb-8">
                <h1 className="text-3xl font-display font-bold tracking-tight">My Courses</h1>
                <p className="text-surface-500 text-sm">Organize and manage your academic subjects</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                    <input
                        type="text"
                        placeholder="Search by name or code..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-2xl focus:border-brand-indigo/50 outline-none transition-all text-sm"
                    />
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="px-6 py-3 bg-brand-indigo text-white rounded-2xl font-medium flex items-center justify-center gap-2 hover:bg-brand-indigo/90 transition-all shadow-lg shadow-brand-indigo/20"
                >
                    <Plus className="w-5 h-5" />
                    <span>Add New Course</span>
                </button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="h-64 rounded-3xl bg-white/5 animate-pulse" />
                    ))}
                </div>
            ) : filteredCourses && filteredCourses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map((course, index) => (
                        <Link key={course.id} to={`/courses/${course.id}`}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="group h-full p-6 rounded-3xl glass-card hover:border-brand-indigo/30 transition-all"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-xl font-display font-bold group-hover:text-brand-indigo transition-colors">{course.course_name}</h3>
                                        <span className="text-xs font-bold text-surface-500 uppercase tracking-widest">{course.course_code}</span>
                                    </div>
                                    {course.is_neglected && (
                                        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                                            <AlertTriangle className="w-4 h-4" />
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-xs font-medium">
                                            <span className="text-surface-500">Progress</span>
                                            <span className="text-brand-indigo">{Math.round(course.progress)}%</span>
                                        </div>
                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-brand-indigo transition-all duration-500"
                                                style={{ width: `${course.progress}%` }}
                                            />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-surface-500 pt-4 border-t border-white/5">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5" />
                                            <span>Exam {new Date(course.exam_date).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-3.5 h-3.5" />
                                            <span>{course.total_hours}h</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-32 bg-white/[0.01] border-2 border-dashed border-white/5 rounded-[48px]">
                    <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <BookOpen className="w-8 h-8 text-surface-700" />
                    </div>
                    <h3 className="text-xl font-display font-bold text-surface-400">No courses found</h3>
                    <p className="text-surface-600 mt-2">Try adjusting your search or add a new course.</p>
                </div>
            )}
        </DashboardLayout>
    );
};

export default CourseList;
