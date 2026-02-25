import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Zap, User, Mail, Building, GraduationCap, ArrowRight, Sparkles } from 'lucide-react';
import './SignUp.css';

export default function SignUp() {
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', college: '', year: '3rd Year' });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        navigate('/onboarding/leetcode');
    };

    return (
        <div className="signup-page">
            {/* Animated Background */}
            <div className="signup-bg">
                <div className="bg-orb bg-orb-1" />
                <div className="bg-orb bg-orb-2" />
                <div className="bg-orb bg-orb-3" />
                <div className="bg-grid" />
            </div>

            <motion.div
                className="signup-container"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: 'easeOut' }}
            >
                {/* Logo */}
                <div className="signup-logo">
                    <motion.div
                        className="logo-badge"
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 4, repeat: Infinity }}
                    >
                        <Zap size={32} />
                    </motion.div>
                    <h1>Ready<span className="logo-accent">360</span></h1>
                    <p className="signup-tagline">Your AI Placement Co-Pilot</p>
                </div>

                {/* Form Card */}
                <motion.div
                    className="signup-card glass-card"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                >
                    <div className="card-header">
                        <Sparkles size={20} className="header-icon" />
                        <h2>Create Your Account</h2>
                        <p>Start your personalized placement journey</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label><User size={14} /> Full Name</label>
                            <input
                                className="input-field"
                                type="text"
                                placeholder="e.g. Arjun Mehta"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label><Mail size={14} /> Email Address</label>
                            <input
                                className="input-field"
                                type="email"
                                placeholder="arjun@college.edu"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label><Building size={14} /> College / University</label>
                            <input
                                className="input-field"
                                type="text"
                                placeholder="e.g. VIT Vellore"
                                value={form.college}
                                onChange={e => setForm({ ...form, college: e.target.value })}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label><GraduationCap size={14} /> Year</label>
                            <select
                                className="input-field"
                                value={form.year}
                                onChange={e => setForm({ ...form, year: e.target.value })}
                            >
                                <option>1st Year</option>
                                <option>2nd Year</option>
                                <option>3rd Year</option>
                                <option>4th Year</option>
                            </select>
                        </div>

                        <motion.button
                            className="btn btn-primary btn-lg signup-btn"
                            type="submit"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            Get Started <ArrowRight size={18} />
                        </motion.button>
                    </form>

                    <div className="signup-footer">
                        <p>Already have an account? <a href="#">Sign in</a></p>
                    </div>
                </motion.div>

                {/* Step indicator */}
                <div className="step-indicator">
                    <div className="step-dot active">1</div>
                    <div className="step-line" />
                    <div className="step-dot">2</div>
                    <div className="step-line" />
                    <div className="step-dot">3</div>
                    <div className="step-line" />
                    <div className="step-dot">4</div>
                </div>
                <p className="step-label">Step 1 of 4 – Account Setup</p>
            </motion.div>
        </div>
    );
}
