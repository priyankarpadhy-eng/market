import { useState, useEffect } from 'react';
import { subscribeToEvents } from '../firebase/services';
import { FiCalendar, FiMapPin, FiClock, FiExternalLink, FiTag, FiSearch, FiPlus } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import './Events.css';

const CATEGORY_COLORS = {
    general: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
    workshop: { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
    hackathon: { bg: '#faf5ff', text: '#7c3aed', border: '#e9d5ff' },
    cultural: { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
    sports: { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' },
    seminar: { bg: '#fef3c7', text: '#b45309', border: '#fde68a' },
    fest: { bg: '#fdf2f8', text: '#be185d', border: '#fbcfe8' },
};

export default function Events() {
    const { isAdmin, isFounder } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('All');

    useEffect(() => {
        const unsub = subscribeToEvents((data) => {
            setEvents(data || []);
            setLoading(false);
        });
        return () => unsub();
    }, []);

    const categories = ['All', ...Object.keys(CATEGORY_COLORS).map(c => c.charAt(0).toUpperCase() + c.slice(1))];

    const filteredEvents = events.filter(e => {
        const matchesSearch = e.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            e.caption?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCat = activeCategory === 'All' || e.category?.toLowerCase() === activeCategory.toLowerCase();
        return matchesSearch && matchesCat;
    });

    return (
        <div className="events-page">
            <div className="events-header">
                <div className="events-title-info">
                    <h1 className="events-title">Events <span className="text-gradient">Hub</span></h1>
                    <p className="events-subtitle">Join workshops, fests, and campus activities at IGIT Sarang.</p>
                </div>
                {(isAdmin || isFounder) && (
                    <button className="create-event-btn">
                        <FiPlus /> Post Event
                    </button>
                )}
            </div>

            <div className="events-filters-bar">
                <div className="events-search">
                    <FiSearch className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search for event name, topic..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="events-cat-chips">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            className={`cat-chip ${activeCategory === cat ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat)}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            <div className="events-full-grid">
                {loading ? (
                    <div className="events-loading">Fetching campus events...</div>
                ) : filteredEvents.length === 0 ? (
                    <div className="events-empty">
                        <FiCalendar size={48} />
                        <p>No events found matching your criteria.</p>
                    </div>
                ) : (
                    <AnimatePresence>
                        {filteredEvents.map((event, i) => (
                            <motion.article
                                key={event.id}
                                className="event-full-card"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                {event.bannerUrl && (
                                    <div className="event-full-banner">
                                        <img src={event.bannerUrl} alt={event.title} />
                                    </div>
                                )}
                                <div className="event-full-content">
                                    <div className="event-full-cat" style={{
                                        background: (CATEGORY_COLORS[event.category?.toLowerCase()] || CATEGORY_COLORS.general).bg,
                                        color: (CATEGORY_COLORS[event.category?.toLowerCase()] || CATEGORY_COLORS.general).text
                                    }}>
                                        <FiTag size={12} /> {event.category || 'General'}
                                    </div>
                                    <h3 className="event-full-title">{event.title}</h3>
                                    <p className="event-full-caption">{event.caption}</p>

                                    <div className="event-full-details">
                                        <div className="detail-item"><FiCalendar /> {event.eventDate}</div>
                                        {event.eventTime && <div className="detail-item"><FiClock /> {event.eventTime}</div>}
                                        {event.location && <div className="detail-item"><FiMapPin /> {event.location}</div>}
                                    </div>

                                    {event.description && <p className="event-full-desc">{event.description}</p>}

                                    {event.registrationLink && (
                                        <a href={event.registrationLink} target="_blank" rel="noopener noreferrer" className="event-full-link">
                                            Register Now <FiExternalLink />
                                        </a>
                                    )}
                                </div>
                            </motion.article>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}
