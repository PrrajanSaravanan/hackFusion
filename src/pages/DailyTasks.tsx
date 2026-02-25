import { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Circle, Zap, Calendar, Trophy } from 'lucide-react';
import { mockDashboard, mockUser } from '../data/mockData';
import './DailyTasks.css';

const allTasks = [
    ...mockDashboard.todayTasks,
    { id: 5, title: 'Review 3 DS&A flashcards', xp: 10, category: 'Learning', completed: false, icon: '🃏' },
    { id: 6, title: 'Star 2 open-source ML repos', xp: 15, category: 'GitHub', completed: false, icon: '⭐' },
    { id: 7, title: 'Practice behavioral question: "Tell me about a challenge"', xp: 20, category: 'AURA', completed: false, icon: '🎤' },
    { id: 8, title: 'Read 1 article on system design', xp: 15, category: 'Learning', completed: true, icon: '📚' },
];

const categories = ['All', 'Coding', 'GitHub', 'Resume', 'Learning', 'AURA'];

const weekHistory = [
    { day: 'Mon', tasks: 5, completed: 4 },
    { day: 'Tue', tasks: 5, completed: 5 },
    { day: 'Wed', tasks: 6, completed: 3 },
    { day: 'Thu', tasks: 5, completed: 5 },
    { day: 'Fri', tasks: 4, completed: 4 },
    { day: 'Sat', tasks: 5, completed: 2 },
    { day: 'Sun', tasks: 4, completed: 0 },
];

export default function DailyTasks() {
    const [tasks, setTasks] = useState(allTasks);
    const [filter, setFilter] = useState('All');

    const toggleTask = (id: number) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const filtered = filter === 'All' ? tasks : tasks.filter(t => t.category === filter);
    const completed = tasks.filter(t => t.completed).length;
    const totalXP = tasks.filter(t => t.completed).reduce((s, t) => s + t.xp, 0);

    return (
        <div className="page-container">
            <motion.div className="page-header" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1>📋 Daily Tasks</h1>
                <p>Complete tasks to earn XP and maintain your streak</p>
            </motion.div>

            {/* Stats Bar */}
            <div className="dt-stats-bar">
                <motion.div className="dt-stat glass-card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <span className="streak-fire">🔥</span>
                    <div>
                        <span className="dt-stat-val">{mockUser.streak}-Day</span>
                        <span className="dt-stat-lbl">Streak</span>
                    </div>
                </motion.div>
                <motion.div className="dt-stat glass-card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <CheckCircle size={20} className="dt-stat-icon green" />
                    <div>
                        <span className="dt-stat-val">{completed}/{tasks.length}</span>
                        <span className="dt-stat-lbl">Completed</span>
                    </div>
                </motion.div>
                <motion.div className="dt-stat glass-card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Zap size={20} className="dt-stat-icon purple" />
                    <div>
                        <span className="dt-stat-val">+{totalXP}</span>
                        <span className="dt-stat-lbl">XP Earned</span>
                    </div>
                </motion.div>
                <motion.div className="dt-stat glass-card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                    <Trophy size={20} className="dt-stat-icon orange" />
                    <div>
                        <span className="dt-stat-val">x1.5</span>
                        <span className="dt-stat-lbl">Streak Bonus</span>
                    </div>
                </motion.div>
            </div>

            <div className="dt-layout">
                {/* Task List */}
                <motion.div className="dt-main glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <div className="dt-filters">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                className={`dt-filter-btn ${filter === cat ? 'active' : ''}`}
                                onClick={() => setFilter(cat)}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="dt-task-list">
                        {filtered.map((task, i) => (
                            <motion.div
                                key={task.id}
                                className={`dt-task-item ${task.completed ? 'completed' : ''}`}
                                onClick={() => toggleTask(task.id)}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.35 + i * 0.05 }}
                                whileHover={{ scale: 1.01, x: 4 }}
                                whileTap={{ scale: 0.99 }}
                            >
                                <div className="dt-task-check">
                                    {task.completed ?
                                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}>
                                            <CheckCircle size={22} className="check-done" />
                                        </motion.div> :
                                        <Circle size={22} className="check-empty" />
                                    }
                                </div>
                                <span className="dt-task-icon">{task.icon}</span>
                                <div className="dt-task-content">
                                    <span className="dt-task-title">{task.title}</span>
                                    <span className="dt-task-cat">{task.category}</span>
                                </div>
                                <div className={`dt-task-xp ${task.completed ? 'earned' : ''}`}>
                                    <Zap size={12} />
                                    +{task.xp} XP
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Weekly Overview */}
                <motion.div className="dt-sidebar" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                    <div className="dt-week glass-card">
                        <h3><Calendar size={16} /> This Week</h3>
                        <div className="dt-week-grid">
                            {weekHistory.map((day, i) => (
                                <div key={day.day} className="dt-week-day">
                                    <span className="dt-day-label">{day.day}</span>
                                    <div className="dt-day-bar-bg">
                                        <motion.div
                                            className="dt-day-bar-fill"
                                            initial={{ height: 0 }}
                                            animate={{ height: `${(day.completed / day.tasks) * 100}%` }}
                                            transition={{ delay: 0.6 + i * 0.05, duration: 0.8 }}
                                            style={{
                                                background: day.completed === day.tasks ? 'var(--accent-green)' :
                                                    day.completed > 0 ? 'var(--accent-purple)' : 'var(--text-muted)'
                                            }}
                                        />
                                    </div>
                                    <span className="dt-day-count">{day.completed}/{day.tasks}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="dt-streak-card glass-card">
                        <h3>🔥 Streak Milestones</h3>
                        <div className="dt-milestones">
                            <div className="milestone achieved"><span>7</span><small>Days ✓</small></div>
                            <div className="milestone achieved"><span>14</span><small>Days ✓</small></div>
                            <div className="milestone current"><span>30</span><small>Days</small></div>
                            <div className="milestone"><span>60</span><small>Days</small></div>
                            <div className="milestone"><span>100</span><small>Days</small></div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
