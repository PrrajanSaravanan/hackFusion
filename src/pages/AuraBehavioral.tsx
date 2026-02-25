import { motion } from 'framer-motion';
import { Brain, Mic, Shield, MessageCircle, Heart, Lightbulb, Target, Info } from 'lucide-react';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { mockAura } from '../data/mockData';
import './AuraBehavioral.css';

export default function AuraBehavioral() {
    const radarData = mockAura.dimensions.map(d => ({
        dimension: d.name.substring(0, 8),
        score: d.score,
        fullMark: 100,
    }));

    return (
        <div className="page-container">
            <motion.div className="page-header" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1>🧠 AURA – Behavioral Analysis</h1>
                <p>Your behavioral interview readiness and soft-skill assessment</p>
            </motion.div>

            {/* Simulated Banner */}
            <motion.div
                className="aura-simulated-banner glass-card"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <Info size={18} />
                <span>This module is currently simulated with mock data. Real video-based analysis coming in future updates.</span>
            </motion.div>

            <div className="aura-layout">
                {/* Overall Score + Radar */}
                <motion.div
                    className="aura-radar-card glass-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <div className="aura-overall">
                        <div className="aura-score-ring">
                            <svg width="140" height="140" viewBox="0 0 140 140">
                                <circle cx="70" cy="70" r="60" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
                                <motion.circle
                                    cx="70" cy="70" r="60" fill="none"
                                    stroke="url(#auraGrad)" strokeWidth="8" strokeLinecap="round"
                                    strokeDasharray={`${2 * Math.PI * 60}`}
                                    initial={{ strokeDashoffset: 2 * Math.PI * 60 }}
                                    animate={{ strokeDashoffset: 2 * Math.PI * 60 * (1 - mockAura.overallScore / 100) }}
                                    transition={{ delay: 0.5, duration: 1.5 }}
                                    transform="rotate(-90 70 70)"
                                />
                                <defs>
                                    <linearGradient id="auraGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#7c4dff" />
                                        <stop offset="100%" stopColor="#18ffff" />
                                    </linearGradient>
                                </defs>
                            </svg>
                            <div className="aura-center">
                                <span className="aura-num">{mockAura.overallScore}</span>
                                <span className="aura-lbl">Overall</span>
                            </div>
                        </div>
                    </div>

                    <ResponsiveContainer width="100%" height={280}>
                        <RadarChart data={radarData}>
                            <PolarGrid stroke="rgba(255,255,255,0.08)" />
                            <PolarAngleAxis dataKey="dimension" tick={{ fill: '#8b92b3', fontSize: 12 }} />
                            <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
                            <Radar dataKey="score" stroke="#7c4dff" fill="rgba(124,77,255,0.2)" strokeWidth={2} dot={{ r: 4, fill: '#7c4dff' }} />
                        </RadarChart>
                    </ResponsiveContainer>
                </motion.div>

                {/* Dimension Scores */}
                <div className="aura-dimensions">
                    {mockAura.dimensions.map((dim, i) => (
                        <motion.div
                            key={dim.name}
                            className="aura-dim-card glass-card"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 + i * 0.08 }}
                        >
                            <div className="dim-icon" style={{ background: `${dim.color}20`, color: dim.color }}>
                                {dim.name === 'Confidence' && <Shield size={20} />}
                                {dim.name === 'Clarity' && <Lightbulb size={20} />}
                                {dim.name === 'Empathy' && <Heart size={20} />}
                                {dim.name === 'Communication' && <MessageCircle size={20} />}
                                {dim.name === 'Problem Solving' && <Brain size={20} />}
                                {dim.name === 'Leadership' && <Target size={20} />}
                            </div>
                            <div className="dim-info">
                                <span className="dim-name">{dim.name}</span>
                                <div className="dim-bar-bg">
                                    <motion.div
                                        className="dim-bar-fill"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${dim.score}%` }}
                                        transition={{ delay: 0.5 + i * 0.08, duration: 0.8 }}
                                        style={{ background: dim.color }}
                                    />
                                </div>
                            </div>
                            <span className="dim-score" style={{ color: dim.color }}>{dim.score}</span>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Behavioral Spikes */}
            <motion.div
                className="aura-spikes glass-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
            >
                <h3>⚡ Behavioral Spikes</h3>
                <p className="spikes-desc">Unique strengths detected in your behavioral signals</p>
                <div className="spike-list">
                    {mockAura.spikes.map((spike, i) => (
                        <motion.div
                            key={i}
                            className="spike-item"
                            initial={{ opacity: 0, x: -15 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8 + i * 0.1 }}
                        >
                            <span className="spike-icon">{spike.icon}</span>
                            <span>{spike.label}</span>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Mock Interview CTA */}
            <motion.div
                className="aura-cta glass-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
            >
                <div className="cta-content">
                    <div className="cta-icon">🎤</div>
                    <div>
                        <h3>Ready for a Mock Interview?</h3>
                        <p>Practice with AI-powered behavioral interview simulation</p>
                    </div>
                </div>
                <motion.button
                    className="btn btn-primary btn-lg"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                >
                    <Mic size={18} /> Start Mock Interview
                </motion.button>
            </motion.div>
        </div>
    );
}
