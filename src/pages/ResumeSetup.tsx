import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, ArrowRight, ArrowLeft, Target, AlertTriangle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { analyzeResume, type ResumeData } from '../services/resumeService';
import './OnboardingPage.css';

export default function ResumeSetup() {
    const navigate = useNavigate();
    const fileRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [fileName, setFileName] = useState('');
    const [data, setData] = useState<ResumeData | null>(null);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        setLoading(true);
        setError('');
        setData(null);

        try {
            const result = await analyzeResume(file);
            setData(result);
        } catch (err: any) {
            setError(err.message || 'Failed to analyze resume');
        } finally {
            setLoading(false);
        }
    };

    const handleComplete = () => {
        navigate('/dashboard');
    };

    const sectionData = data
        ? data.sections.map(s => ({
            name: s.name.split(' ')[0],
            score: s.score,
            fill: s.score >= 80 ? '#69f0ae' : s.score >= 60 ? '#ffab40' : '#ff5252',
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
                <div className="step-indicator">
                    <div className="step-dot completed">✓</div>
                    <div className="step-line completed" />
                    <div className="step-dot completed">✓</div>
                    <div className="step-line completed" />
                    <div className="step-dot completed">✓</div>
                    <div className="step-line completed" />
                    <div className="step-dot active">4</div>
                </div>
                <p className="step-label">Step 4 of 4 – Resume Analysis</p>

                <motion.div className="onboarding-header" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <div className="header-icon-wrap resume-icon">
                        <FileText size={28} />
                    </div>
                    <h1>Upload Your Resume</h1>
                    <p>Get AI-powered ATS analysis, section scores, and improvement suggestions</p>
                </motion.div>

                {/* Upload Zone */}
                {!data && !loading && (
                    <motion.div
                        className="upload-zone"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        onClick={() => fileRef.current?.click()}
                    >
                        <input ref={fileRef} type="file" accept=".pdf" onChange={handleUpload} />
                        <div className="upload-icon">📄</div>
                        <h3>Drop your resume here</h3>
                        <p>PDF format recommended • Click or drag to upload</p>
                    </motion.div>
                )}

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
                            <p>Analyzing your resume with AI...</p>
                            <p className="loading-sub">Checking ATS compatibility, section quality, and keyword optimization</p>
                            <p className="loading-sub" style={{ fontSize: '12px', opacity: 0.6, marginTop: '8px' }}>
                                {fileName}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Analysis */}
                <AnimatePresence>
                    {data && (
                        <motion.div className="stats-container" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                            {/* ATS Score Gauge */}
                            <motion.div className="chart-card glass-card" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 }}>
                                <div className="ats-gauge">
                                    <div className="ats-gauge-circle">
                                        <svg width="180" height="180" viewBox="0 0 180 180">
                                            <circle cx="90" cy="90" r="78" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
                                            <motion.circle
                                                cx="90" cy="90" r="78" fill="none"
                                                stroke="url(#atsGradient)"
                                                strokeWidth="10"
                                                strokeLinecap="round"
                                                strokeDasharray={`${2 * Math.PI * 78}`}
                                                initial={{ strokeDashoffset: 2 * Math.PI * 78 }}
                                                animate={{ strokeDashoffset: 2 * Math.PI * 78 * (1 - data.atsScore / 100) }}
                                                transition={{ delay: 0.3, duration: 1.5, ease: 'easeOut' }}
                                            />
                                            <defs>
                                                <linearGradient id="atsGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                    <stop offset="0%" stopColor="#7c4dff" />
                                                    <stop offset="50%" stopColor="#448aff" />
                                                    <stop offset="100%" stopColor="#18ffff" />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                        <div className="ats-gauge-value">
                                            <span className="score">{data.atsScore}</span>
                                            <span className="label">ATS Score</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Section Scores */}
                            <div className="section-scores">
                                {data.sections.map((section, i) => (
                                    <motion.div
                                        key={section.name}
                                        className="section-score-card glass-card"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3 + i * 0.05 }}
                                    >
                                        <h4>{section.name}</h4>
                                        <div className="score-num" style={{
                                            color: section.score >= 80 ? '#69f0ae' : section.score >= 60 ? '#ffab40' : '#ff5252'
                                        }}>
                                            {section.score}/100
                                        </div>
                                        <p>{section.feedback}</p>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Section Scores Chart */}
                            <motion.div className="chart-card glass-card full-width" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                                <h3>Section-wise Scores</h3>
                                <ResponsiveContainer width="100%" height={220}>
                                    <BarChart data={sectionData}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="name" tick={{ fill: '#8b92b3', fontSize: 11 }} />
                                        <YAxis domain={[0, 100]} tick={{ fill: '#8b92b3', fontSize: 12 }} />
                                        <Tooltip contentStyle={{ background: '#1a1f35', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e8eaf6' }} />
                                        <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                                            {sectionData.map((entry, i) => (
                                                <motion.rect key={i} fill={entry.fill} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </motion.div>

                            {/* Role Likelihood */}
                            <motion.div className="chart-card glass-card full-width" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                                <h3><Target size={16} /> Role Likelihood</h3>
                                <div className="topic-bars" style={{ marginTop: 12 }}>
                                    {data.roleLikelihood.map((role, i) => (
                                        <div key={role.role} className="topic-row">
                                            <span className="topic-name" style={{ width: 170 }}>{role.role}</span>
                                            <div className="topic-bar-wrapper">
                                                <motion.div
                                                    className="topic-bar-fill"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${role.score}%` }}
                                                    transition={{ delay: 0.7 + i * 0.08, duration: 0.8 }}
                                                    style={{
                                                        background: role.score >= 75 ? 'var(--gradient-green)' :
                                                            role.score >= 55 ? 'var(--gradient-blue)' :
                                                                'var(--gradient-orange)'
                                                    }}
                                                />
                                            </div>
                                            <span className="topic-percent">{role.score}%</span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Improvements */}
                            <motion.div className="summary-card glass-card full-width" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                                <div className="summary-header">
                                    <div className="summary-icon">💡</div>
                                    <h3>Improvement Suggestions</h3>
                                </div>
                                <div className="improvements-list">
                                    {data.improvements.map((item, i) => (
                                        <div key={i} className="improvement-item">
                                            <span className={`improvement-priority ${item.priority}`}>{item.priority}</span>
                                            <p>{item.text}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Keywords */}
                                <div className="keywords-section" style={{ marginTop: 24 }}>
                                    <h4 style={{ color: 'var(--accent-green)', marginBottom: 8 }}>✓ Keywords Found</h4>
                                    <div className="keyword-tags">
                                        {data.keywords.present.map(k => (
                                            <span key={k} className="tag tag-green">{k}</span>
                                        ))}
                                    </div>
                                    <h4 style={{ color: 'var(--accent-red)', marginBottom: 8, marginTop: 12 }}>✗ Missing Keywords</h4>
                                    <div className="keyword-tags">
                                        {data.keywords.missing.map(k => (
                                            <span key={k} className="tag tag-red">{k}</span>
                                        ))}
                                    </div>
                                </div>
                            </motion.div>

                            {/* AI Summary */}
                            <motion.div className="summary-card glass-card full-width" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
                                <div className="summary-header">
                                    <div className="summary-icon">🧠</div>
                                    <h3>AI Analysis Summary</h3>
                                </div>
                                <p className="summary-text">{data.summary}</p>
                            </motion.div>

                            {/* Navigation */}
                            <motion.div className="onboarding-nav" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
                                <button className="btn btn-ghost" onClick={() => navigate('/onboarding/github')}>
                                    <ArrowLeft size={16} /> Back
                                </button>
                                <motion.button
                                    className="btn btn-primary btn-lg"
                                    onClick={handleComplete}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    style={{ background: 'linear-gradient(135deg, #69f0ae, #00c853)' }}
                                >
                                    🚀 Complete Setup & Launch Dashboard <ArrowRight size={18} />
                                </motion.button>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
