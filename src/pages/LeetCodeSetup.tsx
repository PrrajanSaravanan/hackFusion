import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Code2, Search, ArrowRight, ArrowLeft, TrendingUp, Target, Trophy, Zap, CheckCircle, AlertTriangle } from 'lucide-react';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, CartesianGrid, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { fetchLeetCodeProfile, type LeetCodeData } from '../services/leetcodeService';
import './OnboardingPage.css';

export default function LeetCodeSetup() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [data, setData] = useState<LeetCodeData | null>(null);

    const handleFetch = async () => {
        if (!username.trim()) return;
        setLoading(true);
        setError('');
        setData(null);

        try {
            const result = await fetchLeetCodeProfile(username.trim());
            setData(result);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch LeetCode profile');
        } finally {
            setLoading(false);
        }
    };

    const difficultyData = data ? [
        { name: 'Easy', value: data.easy, color: '#69f0ae' },
        { name: 'Medium', value: data.medium, color: '#ffab40' },
        { name: 'Hard', value: data.hard, color: '#ff5252' },
    ] : [];

    const radarData = data
        ? data.topicBreakdown.slice(0, 8).map(t => ({
            topic: t.topic.split('/')[0].substring(0, 8),
            proficiency: t.proficiency,
        }))
        : [];

    return (
        <div className="onboarding-page">
            <div className="signup-bg">
                <div className="bg-orb bg-orb-1" />
                <div className="bg-orb bg-orb-2" />
                <div className="bg-orb bg-orb-3" />
                <div className="bg-grid" />
            </div>

            <div className="onboarding-container">
                {/* Step Indicator */}
                <div className="step-indicator">
                    <div className="step-dot completed">✓</div>
                    <div className="step-line completed" />
                    <div className="step-dot active">2</div>
                    <div className="step-line" />
                    <div className="step-dot">3</div>
                    <div className="step-line" />
                    <div className="step-dot">4</div>
                </div>
                <p className="step-label">Step 2 of 4 – Coding Profile</p>

                {/* Header */}
                <motion.div
                    className="onboarding-header"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="header-icon-wrap leetcode-icon">
                        <Code2 size={28} />
                    </div>
                    <h1>Connect Your Coding Profile</h1>
                    <p>Enter your LeetCode username to analyze your coding patterns and strengths</p>
                </motion.div>

                {/* Input */}
                <motion.div
                    className="onboarding-input-card glass-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                >
                    <div className="input-row">
                        <div className="input-icon"><Code2 size={18} /></div>
                        <input
                            className="input-field"
                            type="text"
                            placeholder="Enter your LeetCode username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleFetch()}
                        />
                        <motion.button
                            className="btn btn-primary"
                            onClick={handleFetch}
                            disabled={loading || !username.trim()}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            {loading ? (
                                <div className="spinner" />
                            ) : (
                                <><Search size={16} /> Analyze</>
                            )}
                        </motion.button>
                    </div>
                </motion.div>

                {/* Error State */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            className="error-banner"
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            style={{
                                background: 'rgba(255,82,82,0.12)',
                                border: '1px solid rgba(255,82,82,0.3)',
                                borderRadius: '12px',
                                padding: '12px 16px',
                                color: '#ff5252',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginBottom: '16px',
                            }}
                        >
                            <AlertTriangle size={18} />
                            <span>{error}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Loading State */}
                <AnimatePresence>
                    {loading && (
                        <motion.div
                            className="loading-state"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className="loading-spinner-lg" />
                            <p>Analyzing your coding profile...</p>
                            <p className="loading-sub">Fetching problem stats, topics, and patterns from LeetCode</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Stats Display */}
                <AnimatePresence>
                    {data && (
                        <motion.div
                            className="stats-container"
                            initial={{ opacity: 0, y: 40 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        >
                            {/* Quick Stats */}
                            <div className="quick-stats">
                                <motion.div className="stat-card glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                                    <div className="stat-icon purple"><Trophy size={20} /></div>
                                    <div className="stat-value">{data.totalSolved}</div>
                                    <div className="stat-label">Problems Solved</div>
                                </motion.div>
                                <motion.div className="stat-card glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                                    <div className="stat-icon blue"><TrendingUp size={20} /></div>
                                    <div className="stat-value">{data.contestRating > 0 ? Math.round(data.contestRating) : '—'}</div>
                                    <div className="stat-label">Contest Rating</div>
                                </motion.div>
                                <motion.div className="stat-card glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                                    <div className="stat-icon cyan"><Zap size={20} /></div>
                                    <div className="stat-value">{data.streak > 0 ? data.streak : '—'}</div>
                                    <div className="stat-label">Day Streak 🔥</div>
                                </motion.div>
                                <motion.div className="stat-card glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                                    <div className="stat-icon green"><Target size={20} /></div>
                                    <div className="stat-value">{data.ranking > 0 ? `#${data.ranking.toLocaleString()}` : '—'}</div>
                                    <div className="stat-label">Global Ranking</div>
                                </motion.div>
                            </div>

                            {/* Charts Row */}
                            <div className="charts-row">
                                {/* Difficulty Pie */}
                                <motion.div className="chart-card glass-card" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                                    <h3>Difficulty Distribution</h3>
                                    <ResponsiveContainer width="100%" height={220}>
                                        <PieChart>
                                            <Pie data={difficultyData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" stroke="none">
                                                {difficultyData.map((entry, i) => (
                                                    <Cell key={i} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                contentStyle={{ background: '#1a1f35', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e8eaf6' }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="chart-legend">
                                        {difficultyData.map(d => (
                                            <div key={d.name} className="legend-item">
                                                <span className="legend-dot" style={{ background: d.color }} />
                                                <span>{d.name}: {d.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>

                                {/* Topic Radar */}
                                <motion.div className="chart-card glass-card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                                    <h3>Topic Proficiency</h3>
                                    <ResponsiveContainer width="100%" height={260}>
                                        <RadarChart data={radarData}>
                                            <PolarGrid stroke="rgba(255,255,255,0.08)" />
                                            <PolarAngleAxis dataKey="topic" tick={{ fill: '#8b92b3', fontSize: 11 }} />
                                            <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
                                            <Radar dataKey="proficiency" stroke="#7c4dff" fill="rgba(124,77,255,0.25)" strokeWidth={2} />
                                        </RadarChart>
                                    </ResponsiveContainer>
                                </motion.div>
                            </div>

                            {/* Topic Breakdown Bars */}
                            <motion.div className="chart-card glass-card full-width" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                                <h3>Topic-wise Progress</h3>
                                <div className="topic-bars">
                                    {data.topicBreakdown.map((topic, i) => (
                                        <div key={topic.topic} className="topic-row">
                                            <span className="topic-name">{topic.topic}</span>
                                            <div className="topic-bar-wrapper">
                                                <motion.div
                                                    className="topic-bar-fill"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${topic.proficiency}%` }}
                                                    transition={{ delay: 0.6 + i * 0.05, duration: 0.8 }}
                                                    style={{
                                                        background: topic.proficiency >= 80 ? 'var(--gradient-green)' :
                                                            topic.proficiency >= 60 ? 'var(--gradient-blue)' :
                                                                'var(--gradient-orange)'
                                                    }}
                                                />
                                            </div>
                                            <span className="topic-percent">{topic.proficiency}%</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Progress Trend */}
                            {data.difficultyTrend.length > 0 && (
                                <motion.div className="chart-card glass-card full-width" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                                    <h3>Growth Trajectory</h3>
                                    <ResponsiveContainer width="100%" height={220}>
                                        <LineChart data={data.difficultyTrend}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                            <XAxis dataKey="month" tick={{ fill: '#8b92b3', fontSize: 12 }} />
                                            <YAxis tick={{ fill: '#8b92b3', fontSize: 12 }} />
                                            <Tooltip contentStyle={{ background: '#1a1f35', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e8eaf6' }} />
                                            <Line type="monotone" dataKey="easy" stroke="#69f0ae" strokeWidth={2} dot={{ r: 4 }} />
                                            <Line type="monotone" dataKey="medium" stroke="#ffab40" strokeWidth={2} dot={{ r: 4 }} />
                                            <Line type="monotone" dataKey="hard" stroke="#ff5252" strokeWidth={2} dot={{ r: 4 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </motion.div>
                            )}

                            {/* AI Summary */}
                            <motion.div className="summary-card glass-card full-width" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
                                <div className="summary-header">
                                    <div className="summary-icon">🧠</div>
                                    <h3>AI Analysis Summary</h3>
                                </div>
                                <p className="summary-text">{data.summary}</p>

                                <div className="strengths-weaknesses">
                                    <div className="sw-section">
                                        <h4><CheckCircle size={16} className="sw-icon green" /> Strengths</h4>
                                        <ul>
                                            {data.strengths.map((s, i) => (
                                                <li key={i}>{s}</li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="sw-section">
                                        <h4><AlertTriangle size={16} className="sw-icon orange" /> Areas to Improve</h4>
                                        <ul>
                                            {data.weaknesses.map((w, i) => (
                                                <li key={i}>{w}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                {/* Career Signal Bars */}
                                <div className="career-signals">
                                    <h4><Target size={16} /> Career Domain Signals</h4>
                                    {data.careerSignals.map((signal, i) => (
                                        <div key={signal.domain} className="signal-row">
                                            <span className="signal-domain">{signal.domain}</span>
                                            <div className="signal-bar-wrapper">
                                                <motion.div
                                                    className="signal-bar-fill"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${signal.score}%` }}
                                                    transition={{ delay: 0.9 + i * 0.1, duration: 0.8 }}
                                                />
                                            </div>
                                            <span className="signal-percent">{signal.score}%</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Navigation */}
                            <motion.div className="onboarding-nav" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}>
                                <button className="btn btn-ghost" onClick={() => navigate('/signup')}>
                                    <ArrowLeft size={16} /> Back
                                </button>
                                <motion.button
                                    className="btn btn-primary btn-lg"
                                    onClick={() => navigate('/onboarding/github')}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Next: GitHub Profile <ArrowRight size={18} />
                                </motion.button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
