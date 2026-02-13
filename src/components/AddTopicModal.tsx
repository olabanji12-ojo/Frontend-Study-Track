import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Layers, Clock, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

const topicSchema = z.object({
    topic_name: z.string().min(2, 'Topic name must be at least 2 characters'),
    hours_spent: z.number().min(0, 'Hours cannot be negative').max(100, 'Keep it realistic!'),
    parent_topic_id: z.string().optional(),
});

type TopicForm = z.infer<typeof topicSchema>;

interface AddTopicModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseId: string;
    existingTopics?: { id: string, topic_name: string }[];
    topic?: {
        id: string;
        topic_name: string;
        hours_spent: number;
        parent_topic_id?: string;
    };
}

const AddTopicModal: React.FC<AddTopicModalProps> = ({ isOpen, onClose, courseId, existingTopics, topic }) => {
    const queryClient = useQueryClient();
    const [error, setError] = useState<string | null>(null);
    const [isBulk, setIsBulk] = useState(false);
    const [bulkTopics, setBulkTopics] = useState<string[]>([]);
    const [currentInput, setCurrentInput] = useState('');

    const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm<TopicForm>({
        resolver: zodResolver(topicSchema),
        defaultValues: {
            topic_name: topic?.topic_name || '',
            hours_spent: topic?.hours_spent || 0,
            parent_topic_id: topic?.parent_topic_id || undefined
        }
    });

    React.useEffect(() => {
        if (topic) {
            setValue('topic_name', topic.topic_name);
            setValue('hours_spent', topic.hours_spent);
            setValue('parent_topic_id', topic.parent_topic_id || '');
            setIsBulk(false);
        } else {
            reset({ topic_name: '', hours_spent: 0, parent_topic_id: '' });
            setBulkTopics([]);
            setCurrentInput('');
        }
    }, [topic, setValue, reset]);

    const mutation = useMutation({
        mutationFn: (data: TopicForm | { topics: any[] }) => {
            if ('topics' in data) {
                return api.post(`/courses/${courseId}/topics/bulk`, data);
            }
            if (topic) {
                return api.put(`/courses/${courseId}/topics/${topic.id}`, data);
            }
            return api.post(`/courses/${courseId}/topics`, { ...data, status: 'not_started' });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['topics', courseId] });
            queryClient.invalidateQueries({ queryKey: ['courses'] });
            queryClient.invalidateQueries({ queryKey: ['course', courseId] });
            reset();
            setBulkTopics([]);
            setCurrentInput('');
            setIsBulk(false);
            onClose();
        },
        onError: (err: any) => {
            setError(err.message);
        },
    });

    const handleAddBulkTopic = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && currentInput.trim()) {
            e.preventDefault();
            if (!bulkTopics.includes(currentInput.trim())) {
                setBulkTopics([...bulkTopics, currentInput.trim()]);
            }
            setCurrentInput('');
        }
    };

    const removeBulkTopic = (index: number) => {
        setBulkTopics(bulkTopics.filter((_, i) => i !== index));
    };

    const onSubmit = (data: TopicForm) => {
        setError(null);
        if (isBulk && !topic) {
            if (bulkTopics.length === 0) {
                setError('Please add at least one topic');
                return;
            }
            const topics = bulkTopics.map((name, index) => ({
                topic_name: name,
                topic_order: index + 1
            }));
            mutation.mutate({ topics });
        } else {
            const formattedData = {
                ...data,
                parent_topic_id: data.parent_topic_id === "" ? undefined : data.parent_topic_id
            };
            mutation.mutate(formattedData);
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
                        className="relative w-full max-w-lg bg-surface-950 border border-white/10 rounded-[32px] shadow-2xl overflow-hidden"
                    >
                        <div className="p-8 border-b border-white/5 flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-display font-bold">
                                    {topic?.id ? 'Edit Topic' : topic?.parent_topic_id ? 'Add Sub-topic' : 'Add Topic'}
                                </h2>
                                <p className="text-surface-500 text-sm">
                                    {topic?.id ? 'Update your study goals' : 'Define what you need to study'}
                                </p>
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

                            {!topic?.id && !topic?.parent_topic_id && (
                                <div className="flex items-center justify-between p-1 bg-white/5 rounded-xl">
                                    <button
                                        type="button"
                                        onClick={() => setIsBulk(false)}
                                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${!isBulk ? 'bg-brand-indigo text-white shadow-lg' : 'text-surface-500 hover:text-surface-300'}`}
                                    >
                                        Single Topic
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsBulk(true)}
                                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${isBulk ? 'bg-brand-indigo text-white shadow-lg' : 'text-surface-500 hover:text-surface-300'}`}
                                    >
                                        Bulk Add
                                    </button>
                                </div>
                            )}

                            {!isBulk ? (
                                <>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-surface-400 ml-1">Topic Name</label>
                                        <div className="relative group">
                                            <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500 group-focus-within:text-brand-indigo transition-colors" />
                                            <input
                                                {...register('topic_name')}
                                                placeholder="e.g. Quantum Mechanics Intro"
                                                className="input-field pl-12"
                                            />
                                        </div>
                                        {errors.topic_name && <p className="text-xs text-rose-400 ml-1">{errors.topic_name.message}</p>}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-surface-400 ml-1">Hours Spent (Initial)</label>
                                        <div className="relative group">
                                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500 group-focus-within:text-brand-indigo transition-colors" />
                                            <input
                                                {...register('hours_spent', { valueAsNumber: true })}
                                                type="number"
                                                step="0.5"
                                                className="input-field pl-12"
                                            />
                                        </div>
                                        {errors.hours_spent && <p className="text-xs text-rose-400 ml-1">{errors.hours_spent.message}</p>}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-surface-400 ml-1">Parent Topic</label>
                                        <div className="relative group">
                                            <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500 group-focus-within:text-brand-indigo transition-colors" />
                                            {topic?.parent_topic_id && !topic?.id ? (
                                                <div className="input-field pl-12 flex items-center text-white/50 bg-white/5 cursor-not-allowed">
                                                    {existingTopics?.find(t => t.id === topic.parent_topic_id)?.topic_name || 'Selected Topic'}
                                                </div>
                                            ) : (
                                                <select
                                                    {...register('parent_topic_id')}
                                                    className="input-field pl-12 appearance-none"
                                                >
                                                    <option value="">None</option>
                                                    {existingTopics?.filter(t => t.id !== topic?.id).map((t) => (
                                                        <option key={t.id} value={t.id}>{t.topic_name}</option>
                                                    ))}
                                                </select>
                                            )}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-surface-400 ml-1">Quick Add Topics</label>
                                        <div className="relative group">
                                            <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-500 group-focus-within:text-brand-indigo transition-colors" />
                                            <input
                                                value={currentInput}
                                                onChange={(e) => setCurrentInput(e.target.value)}
                                                onKeyDown={handleAddBulkTopic}
                                                placeholder="Type and press Enter..."
                                                className="input-field pl-12"
                                            />
                                        </div>
                                        <p className="text-[10px] text-surface-600 mt-1 italic">Hit Enter after each topic to add it to the list.</p>
                                    </div>

                                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                                        {bulkTopics.map((item, index) => (
                                            <motion.div
                                                initial={{ scale: 0.8, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                key={index}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-brand-indigo/10 border border-brand-indigo/20 text-brand-indigo rounded-xl text-xs font-medium group"
                                            >
                                                <span>{item}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => removeBulkTopic(index)}
                                                    className="hover:text-rose-400 transition-colors"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </motion.div>
                                        ))}
                                        {bulkTopics.length === 0 && (
                                            <div className="w-full text-center py-8 border-2 border-dashed border-white/5 rounded-2xl">
                                                <p className="text-xs text-surface-600">No topics added yet</p>
                                            </div>
                                        )}
                                    </div>
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
                                        topic ? 'Update Topic' : isBulk ? `Add ${bulkTopics.length} Topics` : 'Add Topic'
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

export default AddTopicModal;
