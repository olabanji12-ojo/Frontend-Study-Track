import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ChevronLeft,
    Plus,
    Clock,
    CheckCircle2,
    MoreVertical,
    Calendar,
    Layers,
    Search,
    BookOpen,
    Edit2,
    Trash2,
    Pause,
    Play,
    RotateCcw
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../services/api';
import AddTopicModal from '../components/AddTopicModal';

interface Topic {
    id: string;
    topic_name: string;
    status: 'not_started' | 'in_progress' | 'completed';
    hours_spent: number;
    parent_topic_id?: string;
}
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

const PomodoroTimer: React.FC<{
    onComplete: (minutes: number) => void;
    topicName: string;
}> = ({ onComplete, topicName }) => {
    const [seconds, setSeconds] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);

    React.useEffect(() => {
        let interval: any = null;
        if (isActive && seconds > 0) {
            interval = setInterval(() => {
                setSeconds((prev) => prev - 1);
            }, 1000);
        } else if (seconds === 0) {
            clearInterval(interval);
            setIsActive(false);
            if (window.confirm(`Session finished for "${topicName}"! Add 25 minutes to your progress?`)) {
                onComplete(25);
            }
            setSeconds(25 * 60);
        }
        return () => clearInterval(interval);
    }, [isActive, seconds, onComplete, topicName]);

    const toggle = () => setIsActive(!isActive);
    const reset = () => {
        setSeconds(25 * 60);
        setIsActive(false);
    };

    const formatTime = (s: number) => {
        const mins = Math.floor(s / 60);
        const secs = s % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex items-center gap-4 p-3 rounded-xl bg-brand-indigo/5 border border-brand-indigo/20">
            <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-brand-indigo tracking-wider">Focus Timer</span>
                <span className="text-xl font-mono font-bold text-white leading-none">{formatTime(seconds)}</span>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={toggle}
                    className={`p-2 rounded-lg transition-colors ${isActive ? 'bg-brand-amber/20 text-brand-amber hover:bg-brand-amber/30' : 'bg-brand-indigo/20 text-brand-indigo hover:bg-brand-indigo/30'}`}
                >
                    {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button
                    onClick={reset}
                    className="p-2 rounded-lg bg-surface-800 text-surface-400 hover:bg-surface-700 transition-colors"
                >
                    <RotateCcw className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

const TopicItem: React.FC<{
    topic: Topic;
    courseId: string;
    index: number;
    onEdit: (topic: Topic) => void;
    onAddSubTopic: (parentId: string) => void;
    topicCount: number;
    isSubTopic?: boolean;
}> = ({ topic, courseId, index, onEdit, onAddSubTopic, topicCount, isSubTopic }) => {
    const queryClient = useQueryClient();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const mutation = useMutation({
        mutationFn: (updates: Partial<Topic>) => api.put(`/courses/${courseId}/topics/${topic.id}`, updates),
        onMutate: async (updates) => {
            await queryClient.cancelQueries({ queryKey: ['topics', courseId] });
            const previousTopics = queryClient.getQueryData<Topic[]>(['topics', courseId]);

            if (previousTopics) {
                queryClient.setQueryData<Topic[]>(['topics', courseId], (old) =>
                    old?.map((t) => (t.id === topic.id ? { ...t, ...updates } : t))
                );
            }

            return { previousTopics };
        },
        onError: (_err, _updates, context) => {
            if (context?.previousTopics) {
                queryClient.setQueryData(['topics', courseId], context.previousTopics);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['topics', courseId] });
            queryClient.invalidateQueries({ queryKey: ['course', courseId] });
            queryClient.invalidateQueries({ queryKey: ['courses'] });
        }
    });

    const deleteMutation = useMutation({
        mutationFn: () => api.delete(`/courses/${courseId}/topics/${topic.id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['topics', courseId] });
            queryClient.invalidateQueries({ queryKey: ['course', courseId] });
            queryClient.invalidateQueries({ queryKey: ['courses'] });
        }
    });

    const [isTimerOpen, setIsTimerOpen] = useState(false);

    const toggleStatus = () => {
        const nextStatus = topic.status === 'completed' ? 'not_started' : topic.status === 'not_started' ? 'in_progress' : 'completed';
        mutation.mutate({ status: nextStatus });
    };

    const handleTimerComplete = (minutes: number) => {
        const currentHours = topic.hours_spent || 0;
        const newHours = currentHours + (minutes / 60);
        mutation.mutate({ hours_spent: Number(newHours.toFixed(2)) });
        setIsTimerOpen(false);
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this topic?')) {
            deleteMutation.mutate();
        }
    };

    return (
        <div className="flex flex-col gap-2">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`group flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] hover:border-brand-indigo/20 transition-all ${isSubTopic ? 'ml-8 scale-[0.98]' : ''}`}
            >
                <button
                    onClick={toggleStatus}
                    className={`mt-1 shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${topic.status === 'completed'
                        ? 'bg-brand-emerald border-brand-emerald text-white'
                        : topic.status === 'in_progress'
                            ? 'border-brand-amber text-brand-amber'
                            : 'border-surface-700 text-transparent hover:border-surface-500'
                        }`}
                >
                    {topic.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-2 h-2 rounded-full bg-current" />}
                </button>

                <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h5 className={`font-medium transition-all ${topic.status === 'completed' ? 'text-surface-500 line-through' : 'text-white'}`}>
                            {topic.topic_name}
                        </h5>
                        <div className="flex items-center gap-3 mt-1">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${topic.status === 'completed' ? 'bg-brand-emerald/10 text-brand-emerald' :
                                topic.status === 'in_progress' ? 'bg-brand-amber/10 text-brand-amber' :
                                    'bg-surface-800 text-surface-500'
                                }`}>
                                {topic.status === 'not_started' ? 'Pending' : topic.status.replace('_', ' ')}
                            </span>
                            <div className="flex items-center gap-1 text-xs text-surface-500">
                                <Clock className="w-3 h-3" />
                                <span>{topic.hours_spent}h spent</span>
                            </div>
                            <div className="flex items-center gap-1 text-[10px] font-bold text-brand-indigo/60 uppercase tracking-wider bg-brand-indigo/5 px-2 py-0.5 rounded-md border border-brand-indigo/10">
                                <span>Weight: {Math.round(100 / (topicCount || 1))}%</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 relative">
                        <button
                            onClick={() => setIsTimerOpen(!isTimerOpen)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${isTimerOpen ? 'bg-brand-indigo text-white' : 'bg-brand-indigo/10 text-brand-indigo hover:bg-brand-indigo/20'}`}
                        >
                            <Clock className="w-3.5 h-3.5" />
                            <span>{isTimerOpen ? 'Hide Timer' : 'Focus'}</span>
                        </button>

                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className={`p-2 rounded-lg transition-colors ${isMenuOpen ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-surface-500 hover:text-white'}`}
                        >
                            <MoreVertical className="w-4 h-4" />
                        </button>

                        <AnimatePresence>
                            {isMenuOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-10"
                                        onClick={() => setIsMenuOpen(false)}
                                    />
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                        className="absolute right-0 top-full mt-2 w-36 bg-surface-900 border border-white/10 rounded-xl shadow-xl z-20 overflow-hidden"
                                    >
                                        <button
                                            onClick={() => {
                                                onEdit(topic);
                                                setIsMenuOpen(false);
                                            }}
                                            className="w-full px-4 py-2.5 text-left text-sm text-surface-300 hover:bg-white/5 hover:text-white flex items-center gap-2 transition-colors"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" />
                                            <span>Edit</span>
                                        </button>
                                        {!isSubTopic && (
                                            <button
                                                onClick={() => {
                                                    onAddSubTopic(topic.id);
                                                    setIsMenuOpen(false);
                                                }}
                                                className="w-full px-4 py-2.5 text-left text-sm text-surface-300 hover:bg-white/5 hover:text-white flex items-center gap-2 transition-colors"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                                <span>Add Sub-topic</span>
                                            </button>
                                        )}
                                        <button
                                            onClick={() => {
                                                handleDelete();
                                                setIsMenuOpen(false);
                                            }}
                                            className="w-full px-4 py-2.5 text-left text-sm text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition-colors"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                            <span>Delete</span>
                                        </button>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
            <AnimatePresence>
                {isTimerOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="pl-14 pb-4">
                            <PomodoroTimer
                                topicName={topic.topic_name}
                                onComplete={handleTimerComplete}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const CourseDetails: React.FC = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
    const [parentTopicId, setParentTopicId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    const { data: course } = useQuery<Course>({
        queryKey: ['course', courseId],
        queryFn: async () => {
            const data = await api.get(`/courses/${courseId}`);
            return data as unknown as Course;
        },
    });

    const { data: topics, isLoading } = useQuery<Topic[]>({
        queryKey: ['topics', courseId],
        queryFn: async () => {
            const data = await api.get(`/courses/${courseId}/topics`);
            return data as unknown as Topic[];
        },
    });

    const filteredTopics = topics?.filter(t =>
        t.topic_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAddSubTopic = (parentId: string) => {
        setParentTopicId(parentId);
        setIsModalOpen(true);
    };

    return (
        <DashboardLayout>
            <AddTopicModal
                isOpen={isModalOpen || !!editingTopic}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingTopic(null);
                    setParentTopicId(null);
                }}
                courseId={courseId!}
                existingTopics={topics?.map(t => ({ id: t.id, topic_name: t.topic_name }))}
                topic={editingTopic ? {
                    id: editingTopic.id,
                    topic_name: editingTopic.topic_name,
                    hours_spent: editingTopic.hours_spent,
                    parent_topic_id: editingTopic.parent_topic_id
                } : parentTopicId ? {
                    id: '',
                    topic_name: '',
                    hours_spent: 0,
                    parent_topic_id: parentTopicId
                } : undefined}
            />

            <div className="mb-8">
                <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 text-surface-500 hover:text-brand-indigo mb-6 group transition-colors"
                >
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="text-sm font-medium">Back to Dashboard</span>
                </Link>

                {course ? (
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                        <div className="space-y-2">
                            <div className="flex items-center gap-3">
                                <span className="px-2 py-1 bg-brand-indigo/10 text-brand-indigo text-xs font-bold rounded uppercase tracking-wider border border-brand-indigo/20">
                                    {course.course_code}
                                </span>
                                <div className="flex items-center gap-1.5 text-xs text-surface-500">
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>Exam {new Date(course.exam_date).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <h1 className="text-4xl font-display font-bold tracking-tight">{course.course_name}</h1>
                        </div>

                        <div className="w-full lg:w-72 space-y-2">
                            <div className="flex justify-between items-end">
                                <p className="text-xs font-medium text-surface-500">Course Mastery</p>
                                <p className="text-sm font-display font-bold text-brand-indigo">{Math.round(course.progress)}%</p>
                            </div>
                            <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${course.progress}%` }}
                                    transition={{ duration: 1 }}
                                    className="h-full bg-gradient-to-r from-brand-indigo to-brand-emerald rounded-full"
                                />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="h-24 w-full bg-white/5 animate-pulse rounded-3xl" />
                )}
            </div>

            <div className="grid lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/[0.03] p-6 rounded-[24px] border border-white/5">
                        <div className="relative flex-1">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-500" />
                            <input
                                type="text"
                                placeholder="Search topics..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-11 pr-4 py-2.5 bg-brand-navy border border-white/10 rounded-xl focus:border-brand-indigo/50 outline-none transition-all text-sm"
                            />
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="px-6 py-2.5 bg-brand-indigo text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-brand-indigo/90 transition-all shadow-lg shadow-brand-indigo/20"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Add Topic</span>
                        </button>
                    </div>

                    <div className="space-y-3">
                        {isLoading ? (
                            [1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="h-20 w-full bg-white/5 animate-pulse rounded-2xl" />
                            ))
                        ) : filteredTopics && filteredTopics.length > 0 ? (
                            (() => {
                                // Separate main topics and sub-topics
                                const mainTopics = filteredTopics.filter(t => !t.parent_topic_id);
                                const subTopics = filteredTopics.filter(t => t.parent_topic_id);

                                return mainTopics.map((topic, index) => (
                                    <React.Fragment key={topic.id}>
                                        <TopicItem
                                            topic={topic}
                                            courseId={courseId!}
                                            index={index}
                                            onEdit={setEditingTopic}
                                            onAddSubTopic={handleAddSubTopic}
                                            topicCount={topics?.length || 0}
                                        />
                                        {subTopics.filter(st => st.parent_topic_id === topic.id).map((sub, sIndex) => (
                                            <TopicItem
                                                key={sub.id}
                                                topic={sub}
                                                courseId={courseId!}
                                                index={index + sIndex + 1}
                                                onEdit={setEditingTopic}
                                                onAddSubTopic={handleAddSubTopic}
                                                topicCount={topics?.length || 0}
                                                isSubTopic
                                            />
                                        ))}
                                    </React.Fragment>
                                ));
                            })()
                        ) : (
                            <div className="text-center py-20 px-8 bg-white/[0.01] border-2 border-dashed border-white/5 rounded-[32px]">
                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Layers className="w-6 h-6 text-surface-700" />
                                </div>
                                <h4 className="font-display font-medium text-surface-400">No topics added yet</h4>
                                <p className="text-xs text-surface-600 mt-1">Break down your course into manageable topics</p>
                            </div>
                        )}
                    </div>
                </div>

                <aside className="space-y-6">
                    <div className="p-6 rounded-3xl glass-card space-y-4">
                        <h4 className="font-display font-bold text-lg">Study Stats</h4>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-surface-500">Total Topics</span>
                                <span className="font-bold">{topics?.length || 0}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-surface-500">Completed</span>
                                <span className="font-bold text-brand-emerald">{topics?.filter(t => t.status === 'completed').length || 0}</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-surface-500">In Progress</span>
                                <span className="font-bold text-brand-amber">{topics?.filter(t => t.status === 'in_progress').length || 0}</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-gradient-to-br from-brand-indigo/10 to-brand-emerald/10 border border-white/5">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-brand-indigo/20">
                                <BookOpen className="w-5 h-5 text-brand-indigo" />
                            </div>
                            <h4 className="font-display font-bold">Smart Guide</h4>
                        </div>
                        <p className="text-xs text-surface-400 leading-relaxed">
                            Research shows that breaking topics into 2-hour sprints increases retention by 40%. Try limiting your sessions!
                        </p>
                    </div>
                </aside>
            </div>
        </DashboardLayout>
    );
};

export default CourseDetails;
