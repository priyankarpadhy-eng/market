import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiShoppingBag, FiCalendar, FiUsers, FiUser, FiZap } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import './MobileNavbar.css';

export default function MobileNavbar() {
    const location = useLocation();

    const { isAdmin } = useAuth();

    const navItems = [
        { to: '/', icon: FiHome, label: 'Home' },
        { to: '/marketplace', icon: FiShoppingBag, label: 'Market' },
        { to: '/events', icon: FiCalendar, label: 'Events' },
        { to: '/rides', icon: FiUsers, label: 'Rides' },
        { to: '/profile', icon: FiUser, label: 'Profile' }
    ];

    if (isAdmin) {
        navItems.splice(4, 0, { to: '/admin', icon: FiZap, label: 'Admin' });
    }

    return (
        <nav className="mobile-navbar">
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.to;
                return (
                    <Link
                        key={item.to}
                        to={item.to}
                        className={`mobile-nav-link ${isActive ? 'active' : ''}`}
                    >
                        <Icon className="mobile-nav-icon" />
                        <span className="mobile-nav-label">{item.label}</span>
                    </Link>
                );
            })}
        </nav>
    );
}
