import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Compass, ListTodo, Briefcase, Brain, User, ChevronLeft, ChevronRight, Zap
} from 'lucide-react';
import { useState } from 'react';
import { mockUser } from '../data/mockData';
import './Sidebar.css';

const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/interest-engine', icon: Compass, label: 'Interest Engine' },
    { path: '/daily-tasks', icon: ListTodo, label: 'Daily Tasks' },
    { path: '/job-tracker', icon: Briefcase, label: 'Job Tracker' },
    { path: '/aura', icon: Brain, label: 'AURA' },
    { path: '/profile', icon: User, label: 'Profile' },
];

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const location = useLocation();

    return (
        <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
            {/* Logo */}
            <div className="sidebar-logo">
                <div className="logo-icon">
                    <Zap size={24} />
                </div>
                {!collapsed && <span className="logo-text">Ready<span className="logo-accent">360</span></span>}
            </div>

            {/* User Card */}
            {!collapsed && (
                <div className="sidebar-user-card">
                    <div className="user-avatar">
                        {mockUser.name.charAt(0)}
                    </div>
                    <div className="user-info">
                        <span className="user-name">{mockUser.name}</span>
                        <div className="user-level">
                            <Zap size={12} className="xp-icon" />
                            Level {mockUser.level}
                        </div>
                    </div>
                    <div className="user-streak">
                        <span className="streak-fire">🔥</span>
                        <span>{mockUser.streak}</span>
                    </div>
                </div>
            )}

            {/* XP Bar */}
            {!collapsed && (
                <div className="sidebar-xp">
                    <div className="xp-label">
                        <span>{mockUser.xp} XP</span>
                        <span>{mockUser.xpToNext} XP</span>
                    </div>
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${(mockUser.xp / mockUser.xpToNext) * 100}%` }} />
                    </div>
                </div>
            )}

            {/* Navigation */}
            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <item.icon size={20} />
                        {!collapsed && <span>{item.label}</span>}
                        {!collapsed && location.pathname === item.path && (
                            <div className="nav-active-indicator" />
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Collapse Toggle */}
            <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>
                {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
        </aside>
    );
}
