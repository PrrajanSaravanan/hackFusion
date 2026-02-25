import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Calendar, Sparkles } from 'lucide-react';
import { mockJobs } from '../data/mockData';
import './JobTracker.css';

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
    applied: { label: 'Applied', color: '#448aff', bg: 'rgba(68,138,255,0.12)' },
    interview: { label: 'Interview', color: '#ffab40', bg: 'rgba(255,171,64,0.12)' },
    offer: { label: 'Offer', color: '#69f0ae', bg: 'rgba(105,240,174,0.12)' },
    rejected: { label: 'Rejected', color: '#ff5252', bg: 'rgba(255,82,82,0.12)' },
};

export default function JobTracker() {
    const [jobs, setJobs] = useState(mockJobs);
    const [showModal, setShowModal] = useState(false);
    const [newJob, setNewJob] = useState({ company: '', role: '', status: 'applied' });

    const handleAdd = () => {
        if (!newJob.company || !newJob.role) return;
        setJobs([...jobs, {
            id: Date.now(),
            company: newJob.company,
            role: newJob.role,
            status: newJob.status,
            date: new Date().toISOString().split('T')[0],
            logo: '🔵',
        }]);
        setNewJob({ company: '', role: '', status: 'applied' });
        setShowModal(false);
    };

    const statuses = ['applied', 'interview', 'offer', 'rejected'];

    const followUps = [
        { company: 'Google', suggestion: 'Send a follow-up email highlighting your ML project experience. Mention the smart-campus-iot project.' },
        { company: 'Amazon', suggestion: 'Prepare system design for distributed systems. Review your LeetCode graph problems before the next round.' },
    ];

    return (
        <div className="page-container">
            <motion.div className="page-header" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1>💼 Job Tracker</h1>
                        <p>Track your applications and AI-powered follow-up suggestions</p>
                    </div>
                    <motion.button
                        className="btn btn-primary"
                        onClick={() => setShowModal(true)}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                    >
                        <Plus size={16} /> Add Application
                    </motion.button>
                </div>
            </motion.div>

            {/* Stats Overview */}
            <div className="jt-stats">
                {statuses.map((s, i) => {
                    const count = jobs.filter(j => j.status === s).length;
                    const cfg = statusConfig[s];
                    return (
                        <motion.div key={s} className="jt-stat-card glass-card" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.05 }}>
                            <div className="jt-stat-dot" style={{ background: cfg.color }} />
                            <span className="jt-stat-count">{count}</span>
                            <span className="jt-stat-label">{cfg.label}</span>
                        </motion.div>
                    );
                })}
            </div>

            {/* Kanban Board */}
            <div className="jt-kanban">
                {statuses.map((status, si) => (
                    <motion.div
                        key={status}
                        className="jt-column"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + si * 0.1 }}
                    >
                        <div className="jt-column-header">
                            <div className="jt-col-dot" style={{ background: statusConfig[status].color }} />
                            <h3>{statusConfig[status].label}</h3>
                            <span className="jt-col-count">{jobs.filter(j => j.status === status).length}</span>
                        </div>
                        <div className="jt-column-content">
                            {jobs.filter(j => j.status === status).map((job, i) => (
                                <motion.div
                                    key={job.id}
                                    className="jt-job-card glass-card"
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.3 + i * 0.05 }}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                >
                                    <div className="jt-job-logo">{job.logo}</div>
                                    <h4>{job.company}</h4>
                                    <p>{job.role}</p>
                                    <div className="jt-job-date">
                                        <Calendar size={12} /> {job.date}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* AI Follow-up Suggestions */}
            <motion.div
                className="jt-followup glass-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
            >
                <div className="jt-followup-header">
                    <Sparkles size={18} className="jt-ai-icon" />
                    <h3>AI Follow-up Suggestions</h3>
                </div>
                <div className="jt-followup-list">
                    {followUps.map((fu, i) => (
                        <div key={i} className="jt-followup-item">
                            <span className="jt-fu-company">{fu.company}</span>
                            <p>{fu.suggestion}</p>
                        </div>
                    ))}
                </div>
            </motion.div>

            {/* Add Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        className="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            className="modal-content glass-card"
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h2>Add Application</h2>
                                <button className="btn btn-ghost" onClick={() => setShowModal(false)}><X size={18} /></button>
                            </div>
                            <div className="modal-body">
                                <div className="input-group">
                                    <label>Company</label>
                                    <input className="input-field" placeholder="e.g. Google" value={newJob.company} onChange={e => setNewJob({ ...newJob, company: e.target.value })} />
                                </div>
                                <div className="input-group">
                                    <label>Role</label>
                                    <input className="input-field" placeholder="e.g. SDE Intern" value={newJob.role} onChange={e => setNewJob({ ...newJob, role: e.target.value })} />
                                </div>
                                <div className="input-group">
                                    <label>Status</label>
                                    <select className="input-field" value={newJob.status} onChange={e => setNewJob({ ...newJob, status: e.target.value })}>
                                        <option value="applied">Applied</option>
                                        <option value="interview">Interview</option>
                                        <option value="offer">Offer</option>
                                        <option value="rejected">Rejected</option>
                                    </select>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                                <button className="btn btn-primary" onClick={handleAdd}>Add Application</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
