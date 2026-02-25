import { motion } from 'framer-motion';
import { Compass, Sparkles, BookOpen, Target, ChevronRight } from 'lucide-react';
import { mockInterestEngine } from '../data/mockData';
import './InterestEngine.css';

export default function InterestEngine() {
    return (
        <div className="page-container">
            <motion.div className="page-header" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1>🧭 Interest Engine</h1>
                <p>AI-powered career domain analysis based on your 360° profile</p>
            </motion.div>

            {/* Fusion Visualization */}
            <motion.div
                className="fusion-card glass-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
            >
                <div className="fusion-header">
                    <Sparkles size={24} className="fusion-icon" />
                    <div>
                        <h2>360° Profile Fusion</h2>
                        <p>Combining signals from all your sources</p>
                    </div>
                </div>
                <div className="fusion-sources">
                    <motion.div className="fusion-node" animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0 }}>
                        <span>💻</span><span>LeetCode</span>
                    </motion.div>
                    <div className="fusion-line" />
                    <motion.div className="fusion-node" animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}>
                        <span>🔗</span><span>GitHub</span>
                    </motion.div>
                    <div className="fusion-line" />
                    <motion.div className="fusion-node" animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}>
                        <span>📄</span><span>Resume</span>
                    </motion.div>
                    <div className="fusion-line" />
                    <motion.div className="fusion-node" animate={{ y: [0, -5, 0] }} transition={{ duration: 2, repeat: Infinity, delay: 0.9 }}>
                        <span>🧠</span><span>AURA</span>
                    </motion.div>
                    <div className="fusion-line" />
                    <motion.div className="fusion-core" animate={{ scale: [1, 1.08, 1], boxShadow: ['0 0 20px rgba(124,77,255,0.3)', '0 0 40px rgba(124,77,255,0.6)', '0 0 20px rgba(124,77,255,0.3)'] }} transition={{ duration: 2, repeat: Infinity }}>
                        <Compass size={28} />
                        <span>AI Engine</span>
                    </motion.div>
                </div>
            </motion.div>

            {/* Top 3 Domains */}
            <div className="domains-grid">
                {mockInterestEngine.topDomains.map((domain, i) => (
                    <motion.div
                        key={domain.name}
                        className="domain-card glass-card"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 + i * 0.15 }}
                    >
                        <div className="domain-rank" style={{ background: domain.gradient }}>#{domain.rank}</div>
                        <div className="domain-emoji">{domain.icon}</div>
                        <h3>{domain.name}</h3>

                        {/* Confidence Bar */}
                        <div className="confidence-section">
                            <div className="confidence-header">
                                <span>Confidence</span>
                                <span className="confidence-value" style={{ color: domain.color }}>{domain.confidence}%</span>
                            </div>
                            <div className="confidence-bar-bg">
                                <motion.div
                                    className="confidence-bar-fill"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${domain.confidence}%` }}
                                    transition={{ delay: 0.6 + i * 0.15, duration: 1.2 }}
                                    style={{ background: domain.gradient }}
                                />
                            </div>
                        </div>

                        <p className="domain-explanation">{domain.explanation}</p>

                        <div className="domain-sources">
                            <h4><Target size={14} /> Data Sources</h4>
                            <ul>
                                {domain.sources.map((src, j) => (
                                    <li key={j}>{src}</li>
                                ))}
                            </ul>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* 30-Day Roadmap */}
            <motion.div
                className="roadmap-section glass-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
            >
                <div className="section-header-ie">
                    <BookOpen size={20} />
                    <h2>📅 Your Personalized 30-Day Roadmap</h2>
                </div>
                <div className="roadmap-timeline">
                    {mockInterestEngine.roadmap.map((phase, i) => (
                        <motion.div
                            key={phase.week}
                            className="roadmap-phase"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 1.0 + i * 0.1 }}
                        >
                            <div className="phase-marker">
                                <div className="phase-dot" />
                                {i < mockInterestEngine.roadmap.length - 1 && <div className="phase-line-v" />}
                            </div>
                            <div className="phase-content">
                                <div className="phase-header">
                                    <span className="phase-week">{phase.week}</span>
                                    <span className="tag tag-purple">{phase.category}</span>
                                </div>
                                <ul className="phase-tasks">
                                    {phase.tasks.map((task, j) => (
                                        <li key={j}><ChevronRight size={12} /> {task}</li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
