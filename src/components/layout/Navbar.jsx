import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FiSearch, FiBell, FiMessageSquare, FiPlus, FiUser, FiShoppingBag, FiLayers, FiImage, FiX } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { globalSearch } from '../../firebase/services';
import './Navbar.css';

export default function Navbar() {
    const { currentUser } = useAuth();
    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);

    const searchRef = useRef(null);

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(async () => {
            if (searchTerm.trim().length > 1) {
                setSearching(true);
                try {
                    const data = await globalSearch(searchTerm);
                    setResults(data);
                    setShowResults(true);
                } catch (err) {
                    console.error('Search error:', err);
                }
                setSearching(false);
            } else {
                setResults([]);
                setShowResults(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm]);





    const getIcon = (type) => {
        switch (type) {
            case 'community': return <FiLayers />;
            case 'marketplace': return <FiShoppingBag />;
            default: return <FiUser />;
        }
    };

    return (
        <nav className="navbar" id="main-navbar">
            <Link to="/" className="navbar-brand">
                <img src="/images/logo.png" alt="Marketplace Logo" className="navbar-logo-img" />
            </Link>



            <div className="navbar-search" ref={searchRef}>
                <FiSearch className="navbar-search-icon" />
                <input
                    type="text"
                    placeholder="Search communities, posts, or items"
                    id="search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onFocus={() => searchTerm.length > 1 && setShowResults(true)}
                />

                {showResults && (
                    <div className="search-dropdown animate-fadeIn">
                        {searching ? (
                            <div className="search-status">Searching...</div>
                        ) : results.length > 0 ? (
                            results.map(item => (
                                <Link
                                    to={item.type === 'community' ? `/feature-requests` : item.type === 'marketplace' ? '/marketplace' : `/post/${item.id}`}
                                    key={item.id}
                                    className="search-result-item"
                                    onClick={() => setShowResults(false)}
                                >
                                    <span className="search-result-icon">{getIcon(item.type)}</span>
                                    <div className="search-result-info">
                                        <div className="search-result-title">{item.title || item.name}</div>
                                        <div className="search-result-type">{item.type}</div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="search-status">No results found</div>
                        )}
                    </div>
                )}
            </div>

            <div className="navbar-actions">
                <button className="navbar-action-btn" id="notifications-btn" title="Notifications">
                    <FiBell />
                    <span className="navbar-notification-dot"></span>
                </button>
                <Link to="/messages" className="navbar-action-btn" id="messages-btn" title="Messages">
                    <FiMessageSquare />
                </Link>

                <Link to="/profile" className="navbar-avatar" id="user-avatar" style={{ padding: 0 }}>
                    {currentUser?.photoURL ? (
                        <img src={currentUser.photoURL} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                        getInitials(currentUser?.displayName)
                    )}
                </Link>
            </div>


        </nav>
    );
}
