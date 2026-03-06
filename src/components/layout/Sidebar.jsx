import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiHome, FiCompass, FiShoppingBag, FiMessageCircle, FiUsers, FiUser, FiSettings, FiLogOut, FiShield, FiCode, FiHeart, FiMusic, FiAward, FiCalendar } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import MusicPlayer from '../music/MusicPlayer';

import './Sidebar.css';

export default function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { currentUser, logout, isAdmin, isFounder } = useAuth();



    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

    const navLinks = [
        { to: '/', icon: FiHome, label: 'Home Feed' }
    ];

    if (!currentUser?.isAnonymous) {
        navLinks.push(
            { to: '/events', icon: FiCalendar, label: 'Events Hub' },
            { to: '/feature-requests', icon: FiCode, label: 'Feature Requests' },
            { to: '/marketplace', icon: FiShoppingBag, label: 'Marketplace' },
            { to: '/messages', icon: FiMessageCircle, label: 'Messages' },
            { to: '/music', icon: FiMusic, label: 'Music Player' },
            { to: '/members', icon: FiUsers, label: 'Members' },
            { to: '/profile', icon: FiUser, label: 'Profile' },
            { to: '/settings', icon: FiSettings, label: 'Settings' }
        );
    }

    if (isAdmin) {
        navLinks.push({
            to: '/admin',
            icon: isFounder ? FiAward : FiShield,
            label: isFounder ? 'Founder Console' : 'Admin Panel',
            className: 'admin-nav-item'
        });
    }

    return (
        <aside className="sidebar" id="main-sidebar">
            <div className="sidebar-section">
                <p className="sidebar-label">Navigation</p>
                <nav className="sidebar-nav">
                    {navLinks.map((link) => {
                        const Icon = link.icon;
                        return (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={`sidebar-link ${location.pathname === link.to ? 'active' : ''}`}
                            >
                                <span className="sidebar-link-icon"><Icon /></span>
                                {link.label}
                            </Link>
                        );
                    })}

                </nav>
            </div>
            <div className="sidebar-footer" style={{ marginTop: 'auto', paddingTop: '20px' }}>
                {currentUser?.isAnonymous ? (
                    <div style={{
                        background: 'linear-gradient(135deg, #eff6ff, #eef2ff)',
                        border: '1px solid #bfdbfe',
                        borderRadius: '12px',
                        padding: '14px',
                        marginBottom: '12px',
                        textAlign: 'center'
                    }}>
                        <div style={{ fontSize: '0.75rem', color: '#1e40af', fontWeight: 700, marginBottom: '4px' }}>You're browsing as Guest</div>
                        <div style={{ fontSize: '0.72rem', color: '#64748b', marginBottom: '10px' }}>Unlock all features by creating an account</div>
                        <Link to="/auth" state={{ mode: 'signup' }} style={{
                            display: 'block',
                            background: '#2563eb',
                            color: 'white',
                            padding: '7px 12px',
                            borderRadius: '8px',
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            textDecoration: 'none',
                            textAlign: 'center'
                        }}>Create Free Account 🚀</Link>
                    </div>
                ) : null}
                <div style={{ padding: '0 12px', display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
                    <a
                        href="https://chat.whatsapp.com/L18veuCIe5b1uFiaCCjcLa"
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ fontSize: '0.8rem', color: '#16a34a', textDecoration: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}
                    >
                        <span style={{ fontSize: '1rem' }}>💬</span> Join WhatsApp Group
                    </a>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <Link to="/privacy" style={{ fontSize: '0.75rem', color: '#94a3b8', textDecoration: 'none' }}>Privacy Policy</Link>
                        <Link to="/terms" style={{ fontSize: '0.75rem', color: '#94a3b8', textDecoration: 'none' }}>Terms of Use</Link>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="sidebar-link logout-btn"
                    style={{ width: '100%', border: 'none', background: 'none', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', color: '#dc2626' }}
                >
                    <FiLogOut /> {currentUser?.isAnonymous ? 'Exit Guest Mode' : 'Logout'}
                </button>
            </div>
        </aside>
    );
}
