import { motion } from 'framer-motion';
import { Mail, Building, GraduationCap, Github, Code2, FileText, Zap, Award, TrendingUp, Settings, Bell, Moon, LogOut } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { mockUser, mockDashboard } from '../data/mockData';
import './Profile.css';

const xpHistory = [
    { week: 'W1', xp: 320 },
    { week: 'W2', xp: 480 },
    { week: 'W3', xp: 620 },
    { week: 'W4', xp: 890 },
    { week: 'W5', xp: 1250 },
    { week: 'W6', xp: 1680 },
    { week: 'W7', xp: 2100 },
    { week: 'W8', xp: 2840 },
];

export default function Profile() {
    return (
        <div className="page-container">
            <motion.div className="page-header" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <h1>👤 Profile & Settings</h1>
                <p>Manage your account, connections, and preferences</p>
            </motion.div>

            <div className="profile-layout">
                {/* User Info */}
                <motion.div
                    className="profile-user-card glass-card"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="profile-avatar">
                        <span>{mockUser.name.charAt(0)}</span>
                        <div className="profile-level-badge">Lv.{mockUser.level}</div>
                    </div>
                    <h2>{mockUser.name}</h2>
                    <p className="profile-tagline">{mockUser.college} • {mockUser.year} • {mockUser.branch}</p>

                    <div className="profile-stats-row">
                        <div className="profile-stat">
                            <Zap size={16} className="ps-icon purple" />
                            <span className="ps-val">{mockUser.xp.toLocaleString()}</span>
                            <span className="ps-lbl">Total XP</span>
                        </div>
                        <div className="profile-stat">
                            <span className="streak-fire" style={{ fontSize: '1.1rem' }}>🔥</span>
                            <span className="ps-val">{mockUser.streak}</span>
                            <span className="ps-lbl">Day Streak</span>
                        </div>
                        <div className="profile-stat">
                            <Award size={16} className="ps-icon orange" />
                            <span className="ps-val">{mockUser.totalBadges}</span>
                            <span className="ps-lbl">Badges</span>
                        </div>
                    </div>

                    <div className="profile-details">
                        <div className="detail-row"><Mail size={14} /> {mockUser.email}</div>
                        <div className="detail-row"><Building size={14} /> {mockUser.college}</div>
                        <div className="detail-row"><GraduationCap size={14} /> {mockUser.year} – {mockUser.branch}</div>
                    </div>
                </motion.div>

                <div className="profile-right">
                    {/* Connected Accounts */}
                    <motion.div
                        className="profile-connections glass-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h3>🔗 Connected Accounts</h3>
                        <div className="connection-list">
                            <div className="connection-item connected">
                                <Code2 size={18} className="conn-icon" style={{ color: '#f89f1b' }} />
                                <div className="conn-info">
                                    <span className="conn-name">LeetCode</span>
                                    <span className="conn-user">@arjun_mehta</span>
                                </div>
                                <span className="conn-status tag tag-green">Connected</span>
                            </div>
                            <div className="connection-item connected">
                                <Github size={18} className="conn-icon" />
                                <div className="conn-info">
                                    <span className="conn-name">GitHub</span>
                                    <span className="conn-user">@arjunmehta</span>
                                </div>
                                <span className="conn-status tag tag-green">Connected</span>
                            </div>
                            <div className="connection-item connected">
                                <FileText size={18} className="conn-icon" style={{ color: '#448aff' }} />
                                <div className="conn-info">
                                    <span className="conn-name">Resume</span>
                                    <span className="conn-user">resume_arjun.pdf</span>
                                </div>
                                <span className="conn-status tag tag-green">Uploaded</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* XP History */}
                    <motion.div
                        className="profile-xp-chart glass-card"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <h3>📈 XP Growth</h3>
                        <ResponsiveContainer width="100%" height={180}>
                            <AreaChart data={xpHistory}>
                                <defs>
                                    <linearGradient id="profXpGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#7c4dff" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#7c4dff" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="week" tick={{ fill: '#8b92b3', fontSize: 11 }} />
                                <YAxis tick={{ fill: '#8b92b3', fontSize: 11 }} />
                                <Tooltip contentStyle={{ background: '#1a1f35', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#e8eaf6' }} />
                                <Area type="monotone" dataKey="xp" stroke="#7c4dff" strokeWidth={2} fillOpacity={1} fill="url(#profXpGrad)" dot={{ r: 3, fill: '#7c4dff' }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </motion.div>
                </div>
            </div>

            {/* Badge Cabinet */}
            <motion.div
                className="profile-badges glass-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <h3>🏆 Badge Cabinet</h3>
                <div className="profile-badge-grid">
                    {mockDashboard.badges.map((badge, i) => (
                        <motion.div
                            key={badge.id}
                            className={`profile-badge ${badge.earned ? 'earned' : 'locked'}`}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 + i * 0.04, type: 'spring' }}
                            title={badge.description}
                        >
                            <span className="profile-badge-icon">{badge.icon}</span>
                            <span className="profile-badge-name">{badge.name}</span>
                            {badge.earned && <span className="profile-badge-check">✓</span>}
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Settings */}
            <motion.div
                className="profile-settings glass-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <h3><Settings size={16} /> Settings</h3>
                <div className="settings-list">
                    <div className="setting-item">
                        <div className="setting-info">
                            <Bell size={16} /> <span>Daily Task Notifications</span>
                        </div>
                        <label className="toggle">
                            <input type="checkbox" defaultChecked />
                            <span className="toggle-slider" />
                        </label>
                    </div>
                    <div className="setting-item">
                        <div className="setting-info">
                            <Moon size={16} /> <span>Dark Mode</span>
                        </div>
                        <label className="toggle">
                            <input type="checkbox" defaultChecked />
                            <span className="toggle-slider" />
                        </label>
                    </div>
                    <div className="setting-item">
                        <div className="setting-info">
                            <TrendingUp size={16} /> <span>Weekly Progress Reports</span>
                        </div>
                        <label className="toggle">
                            <input type="checkbox" defaultChecked />
                            <span className="toggle-slider" />
                        </label>
                    </div>
                </div>
                <button className="btn btn-secondary" style={{ marginTop: 16, color: 'var(--accent-red)' }}>
                    <LogOut size={16} /> Sign Out
                </button>
            </motion.div>
        </div>
    );
}
