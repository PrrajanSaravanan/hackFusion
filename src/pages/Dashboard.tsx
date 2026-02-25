import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, CheckCircle, Circle, Award, Sparkles, ArrowRight } from 'lucide-react';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, AreaChart, Area } from 'recharts';
import { mockUser, mockDashboard } from '../data/mockData';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

export default function Dashboard() {
    const navigate = useNavigate();
    const [animatedXP, setAnimatedXP] = useState(0);
    const [animatedLevel, setAnimatedLevel] = useState(0);
    const [showConfetti, setShowConfetti] = useState(true);
    const [tasks, setTasks] = useState(mockDashboard.todayTasks);

    useEffect(() => {
        // Animate XP counter
        const xpInterval = setInterval(() => {
            setAnimatedXP(prev => {
                if (prev >= mockUser.xp) return mockUser.xp;
                return prev + Math.ceil(mockUser.xp / 40);
            });
        }, 30);

        // Animate level
        setTimeout(() => setAnimatedLevel(mockUser.level), 500);

        // Hide confetti after 4s
        setTimeout(() => setShowConfetti(false), 4000);

        return () => clearInterval(xpInterval);
    }, []);

    const toggleTask = (id: number) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const completedTasks = tasks.filter(t => t.completed).length;
    const totalXPToday = tasks.filter(t => t.completed).reduce((sum, t) => sum + t.xp, 0);

    const confettiColors = ['#7c4dff', '#448aff', '#18ffff', '#69f0ae', '#ffab40', '#ff4081', '#ffd740'];

    return (
        <div className="dashboard-page">
            {/* Confetti */}
            {showConfetti && (
                <div className="confetti-container">
                    {Array.from({ length: 40 }).map((_, i) => (
                        <div
                            key={i}
                            className="confetti-piece"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${100 + Math.random() * 20}%`,
                                background: confettiColors[i % confettiColors.length],
                                animationDelay: `${Math.random() * 2}s`,
                                animationDuration: `${2 + Math.random() * 2}s`,
                                width: `${6 + Math.random() * 8}px`,
                                height: `${6 + Math.random() * 8}px`,
                                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                            }}
                        />
                    ))}
                </div>
            )}

            <div className="page-container">
                {/* Welcome Header */}
                <motion.div
                    className="dashboard-welcome"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="welcome-text">
                        <h1>Welcome back, <span className="name-gradient">{mockUser.name.split(' ')[0]}</span> 👋</h1>
                        <p>Here's your placement readiness overview for today</p>
                    </div>
                    <div className="welcome-badges">
                        <div className="streak-badge">
                            <span className="streak-fire">🔥</span>
                            <span className="streak-num">{mockUser.streak}</span>
                            <span className="streak-text">Day Streak</span>
                        </div>
                    </div>
                </motion.div>

                {/* Top Stats Row */}
                <div className="top-stats">
                    {/* Level & XP */}
                    <motion.div
                        className="level-card glass-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <div className="level-ring">
                            <svg width="120" height="120" viewBox="0 0 120 120">
                                <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                                <motion.circle
                                    cx="60" cy="60" r="52" fill="none"
                                    stroke="url(#lvlGrad)"
                                    strokeWidth="8" strokeLinecap="round"
                                    strokeDasharray={`${2 * Math.PI * 52}`}
                                    initial={{ strokeDashoffset: 2 * Math.PI * 52 }}
                                    animate={{ strokeDashoffset: 2 * Math.PI * 52 * (1 - mockUser.xp / mockUser.xpToNext) }}
                                    transition={{ delay: 0.5, duration: 1.5, ease: 'easeOut' }}
                                    transform="rotate(-90 60 60)"
                                />
                                <defs>
                                    <linearGradient id="lvlGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#7c4dff" />
                                        <stop offset="100%" stopColor="#18ffff" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="level-center">
                                <span className="level-num">{animatedLevel}</span>
                                <span className="level-label">LEVEL</span>
                            </div>
                        </div>
                        <div className="level-info">
                            <div className="xp-display">
                                <Zap size={16} className="xp-bolt" />
                                <span className="xp-num">{animatedXP.toLocaleString()}</span>
                                <span className="xp-total">/ {mockUser.xpToNext.toLocaleString()} XP</span>
                            </div>
                            <div className="progress-bar" style={{ height: 6 }}>
                                <motion.div
                                    className="progress-fill"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(mockUser.xp / mockUser.xpToNext) * 100}%` }}
                                    transition={{ delay: 0.5, duration: 1.5 }}
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* Today's XP */}
                    <motion.div className="mini-stat glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                        <div className="mini-stat-icon" style={{ background: 'rgba(124,77,255,0.15)', color: '#7c4dff' }}><Sparkles size={22} /></div>
                        <div className="mini-stat-value">{totalXPToday}</div>
                        <div className="mini-stat-label">XP Today</div>
                    </motion.div>

                    {/* Tasks Done */}
                    <motion.div className="mini-stat glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                        <div className="mini-stat-icon" style={{ background: 'rgba(105,240,174,0.15)', color: '#69f0ae' }}><CheckCircle size={22} /></div>
                        <div className="mini-stat-value">{completedTasks}/{tasks.length}</div>
                        <div className="mini-stat-label">Tasks Done</div>
                    </motion.div>

                    {/* Badges */}
                    <motion.div className="mini-stat glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                        <div className="mini-stat-icon" style={{ background: 'rgba(255,215,64,0.15)', color: '#ffd740' }}><Award size={22} /></div>
                        <div className="mini-stat-value">{mockUser.totalBadges}</div>
                        <div className="mini-stat-label">Badges Earned</div>
                    </motion.div>
                </div>

                <div className="dashboard-grid">
                    {/* Today's Tasks */}
                    <motion.div
                        className="tasks-section glass-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <div className="section-header">
                            <h2>🎯 Today's Quests</h2>
                            <span className="tag tag-purple">{completedTasks}/{tasks.length} Complete</span>
                        </div>
                        <div className="task-list">
                            {tasks.map((task, i) => (
                                <motion.div
                                    key={task.id}
                                    className={`task-item ${task.completed ? 'completed' : ''}`}
                                    onClick={() => toggleTask(task.id)}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + i * 0.1 }}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                >
                                    <div className="task-check">
                                        {task.completed ? <CheckCircle size={20} className="check-done" /> : <Circle size={20} className="check-empty" />}
                                    </div>
                                    <div className="task-content">
                                        <span className="task-icon">{task.icon}</span>
                                        <span className="task-title">{task.title}</span>
                                    </div>
                                    <div className="task-xp">
                                        <Zap size={12} />
                                        +{task.xp} XP
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* XP History Chart */}
                    <motion.div
                        className="chart-section glass-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                    >
                        <div className="section-header">
                            <h2>📊 XP This Week</h2>
                        </div>
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={mockDashboard.xpHistory}>
                                <defs>
                                    <linearGradient id="xpGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#7c4dff" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#7c4dff" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="day" tick={{ fill: '#8b92b3', fontSize: 12 }} />
                                <YAxis tick={{ fill: '#8b92b3', fontSize: 12 }} />
                                <Tooltip contentStyle={{ background: '#1a1f35', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e8eaf6' }} />
                                <Area type="monotone" dataKey="xp" stroke="#7c4dff" strokeWidth={2} fillOpacity={1} fill="url(#xpGrad)" dot={{ r: 4, fill: '#7c4dff' }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </motion.div>

                    {/* Domain Readiness */}
                    <motion.div
                        className="domain-section glass-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                    >
                        <div className="section-header">
                            <h2>🎯 Domain Readiness</h2>
                            <button className="btn btn-ghost btn-sm" onClick={() => navigate('/interest-engine')}>View Details <ArrowRight size={14} /></button>
                        </div>
                        <div className="domain-bars">
                            {mockDashboard.domainReadiness.map((domain, i) => (
                                <div key={domain.domain} className="domain-row">
                                    <span className="domain-name">{domain.domain}</span>
                                    <div className="domain-bar-bg">
                                        <motion.div
                                            className="domain-bar-fill"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${domain.readiness}%` }}
                                            transition={{ delay: 0.7 + i * 0.1, duration: 1 }}
                                            style={{ background: domain.color }}
                                        />
                                    </div>
                                    <span className="domain-pct" style={{ color: domain.color }}>{domain.readiness}%</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* ATS Trend */}
                    <motion.div
                        className="ats-section glass-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                    >
                        <div className="section-header">
                            <h2>📄 Resume ATS Trend</h2>
                            <span className="tag tag-green">↑ +22 pts</span>
                        </div>
                        <ResponsiveContainer width="100%" height={180}>
                            <LineChart data={mockDashboard.atsTrend}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="week" tick={{ fill: '#8b92b3', fontSize: 12 }} />
                                <YAxis domain={[40, 100]} tick={{ fill: '#8b92b3', fontSize: 12 }} />
                                <Tooltip contentStyle={{ background: '#1a1f35', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e8eaf6' }} />
                                <Line type="monotone" dataKey="score" stroke="#69f0ae" strokeWidth={2.5} dot={{ r: 5, fill: '#69f0ae' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </motion.div>

                    {/* Badge Cabinet */}
                    <motion.div
                        className="badge-section glass-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                    >
                        <div className="section-header">
                            <h2>🏆 Badge Cabinet</h2>
                            <span className="tag tag-purple">{mockDashboard.badges.filter(b => b.earned).length}/{mockDashboard.badges.length}</span>
                        </div>
                        <div className="badge-grid">
                            {mockDashboard.badges.map((badge, i) => (
                                <motion.div
                                    key={badge.id}
                                    className={`badge-item ${badge.earned ? 'earned' : 'locked'}`}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.9 + i * 0.05, type: 'spring' }}
                                    title={badge.description}
                                >
                                    <span className="badge-emoji">{badge.icon}</span>
                                    <span className="badge-name">{badge.name}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
