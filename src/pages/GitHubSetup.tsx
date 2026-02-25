import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, Search, ArrowRight, ArrowLeft, Star, GitFork, TrendingUp, CheckCircle, AlertTriangle, Target, Code2 } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { fetchGitHubProfile, type GitHubData } from '../services/githubService';
import './OnboardingPage.css';

export default function GitHubSetup() {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [data, setData] = useState<GitHubData | null>(null);

    const handleFetch = async () => {
        if (!username.trim()) return;
        setLoading(true);
        setError('');
        setData(null);

        try {
            const result = await fetchGitHubProfile(username.trim());
            setData(result);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch GitHub profile');
        } finally {
            setLoading(false);
        }
    };

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
                    <div className="step-dot completed">✓</div>
                    <div className="step-line completed" />
                    <div className="step-dot active">3</div>
                    <div className="step-line" />
                    <div className="step-dot">4</div>
                </div>
                <p className="step-label">Step 3 of 4 – GitHub Profile</p>

                <motion.div
                    className="onboarding-header"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="header-icon-wrap github-icon">
                        <Github size={28} />
                    </div>
                    <h1>Connect Your GitHub</h1>
                    <p>Analyze your repositories, tech stack, and coding passion signals</p>
                </motion.div>

                <motion.div
                    className="onboarding-input-card glass-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="input-row">
                        <div className="input-icon"><Github size={18} /></div>
                        <input
                            className="input-field"
                            type="text"
                            placeholder="Enter your GitHub username"
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
                            {loading ? <div className="spinner" /> : <><Search size={16} /> Analyze</>}
                        </motion.button>
                    </div>
                </motion.div>

                {/* Error State */}
                <AnimatePresence>
                    {error && (
                        <motion.div
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

                {/* Loading */}
                <AnimatePresence>
                    {loading && (
                        <motion.div className="loading-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className="loading-spinner-lg" />
                            <p>Scanning your repositories...</p>
                            <p className="loading-sub">Analyzing tech stacks, commit patterns, and passion signals</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Stats */}
                <AnimatePresence>
                    {data && (
                        <motion.div className="stats-container" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                            {/* Quick Stats */}
                            <div className="quick-stats">
                                <motion.div className="stat-card glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                                    <div className="stat-icon green"><Code2 size={20} /></div>
                                    <div className="stat-value">{data.totalRepos}</div>
                                    <div className="stat-label">Repositories</div>
                                </motion.div>
                                <motion.div className="stat-card glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                                    <div className="stat-icon purple"><TrendingUp size={20} /></div>
                                    <div className="stat-value">{data.totalCommits}</div>
                                    <div className="stat-label">Total Commits</div>
                                </motion.div>
                                <motion.div className="stat-card glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                                    <div className="stat-icon orange"><Star size={20} /></div>
                                    <div className="stat-value">{data.totalStars}</div>
                                    <div className="stat-label">Stars Earned</div>
                                </motion.div>
                                <motion.div className="stat-card glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                                    <div className="stat-icon cyan"><Target size={20} /></div>
                                    <div className="stat-value">{data.voluntaryEffortScore}</div>
                                    <div className="stat-label">Effort Score</div>
                                </motion.div>
                            </div>

                            {/* Top Repos */}
                            <motion.div className="chart-card glass-card full-width" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                                <h3>Top Repositories</h3>
                                <div className="repo-grid">
                                    {data.repositories.map((repo, i) => (
                                        <motion.div key={repo.name} className="repo-card glass-card" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 + i * 0.05 }}>
                                            <h4>{repo.name}</h4>
                                            <p>{repo.description}</p>
                                            <div className="repo-meta">
                                                <span className="tag tag-blue">{repo.language}</span>
                                                <span><Star size={12} /> {repo.stars}</span>
                                                <span><GitFork size={12} /> {repo.forks}</span>
                                                <span className="tag tag-purple">{repo.domain}</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Charts Row */}
                            <div className="charts-row">
                                <motion.div className="chart-card glass-card" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}>
                                    <h3>Domain Distribution</h3>
                                    <ResponsiveContainer width="100%" height={220}>
                                        <PieChart>
                                            <Pie data={data.domainDistribution} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" stroke="none">
                                                {data.domainDistribution.map((entry, i) => (
                                                    <Cell key={i} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip contentStyle={{ background: '#1a1f35', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e8eaf6' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="chart-legend">
                                        {data.domainDistribution.map(d => (
                                            <div key={d.domain} className="legend-item">
                                                <span className="legend-dot" style={{ background: d.color }} />
                                                <span>{d.domain}: {d.value}%</span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>

                                <motion.div className="chart-card glass-card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 }}>
                                    <h3>Commit Velocity</h3>
                                    <ResponsiveContainer width="100%" height={220}>
                                        <LineChart data={data.commitVelocity}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                            <XAxis dataKey="month" tick={{ fill: '#8b92b3', fontSize: 12 }} />
                                            <YAxis tick={{ fill: '#8b92b3', fontSize: 12 }} />
                                            <Tooltip contentStyle={{ background: '#1a1f35', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e8eaf6' }} />
                                            <Line type="monotone" dataKey="commits" stroke="#69f0ae" strokeWidth={2} dot={{ r: 4, fill: '#69f0ae' }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </motion.div>
                            </div>

                            {/* Tech Stack */}
                            <motion.div className="chart-card glass-card full-width" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
                                <h3>Tech Stack Distribution</h3>
                                <div className="topic-bars">
                                    {data.techStack.map((tech, i) => (
                                        <div key={tech.name} className="topic-row">
                                            <span className="topic-name">{tech.name}</span>
                                            <div className="topic-bar-wrapper">
                                                <motion.div
                                                    className="topic-bar-fill"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${tech.percentage}%` }}
                                                    transition={{ delay: 0.8 + i * 0.08, duration: 0.8 }}
                                                    style={{ background: tech.color }}
                                                />
                                            </div>
                                            <span className="topic-percent">{tech.percentage}%</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* AI Summary */}
                            <motion.div className="summary-card glass-card full-width" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
                                <div className="summary-header">
                                    <div className="summary-icon">🔍</div>
                                    <h3>AI Analysis Summary</h3>
                                </div>
                                <p className="summary-text">{data.summary}</p>

                                <div className="strengths-weaknesses">
                                    <div className="sw-section">
                                        <h4><CheckCircle size={16} className="sw-icon green" /> Strengths</h4>
                                        <ul>{data.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
                                    </div>
                                    <div className="sw-section">
                                        <h4><AlertTriangle size={16} className="sw-icon orange" /> Areas to Improve</h4>
                                        <ul>{data.weaknesses.map((w, i) => <li key={i}>{w}</li>)}</ul>
                                    </div>
                                </div>

                                <div className="career-signals">
                                    <h4><Target size={16} /> Career Domain Signals</h4>
                                    {data.careerSignals.map((signal, i) => (
                                        <div key={signal.domain} className="signal-row">
                                            <span className="signal-domain">{signal.domain}</span>
                                            <div className="signal-bar-wrapper">
                                                <motion.div className="signal-bar-fill" initial={{ width: 0 }} animate={{ width: `${signal.score}%` }} transition={{ delay: 1.0 + i * 0.1, duration: 0.8 }} />
                                            </div>
                                            <span className="signal-percent">{signal.score}%</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            <motion.div className="onboarding-nav" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.1 }}>
                                <button className="btn btn-ghost" onClick={() => navigate('/onboarding/leetcode')}>
                                    <ArrowLeft size={16} /> Back
                                </button>
                                <motion.button className="btn btn-primary btn-lg" onClick={() => navigate('/onboarding/resume')} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                    Next: Resume Upload <ArrowRight size={18} />
                                </motion.button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
