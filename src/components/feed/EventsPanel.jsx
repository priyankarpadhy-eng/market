import { useState, useEffect } from 'react';
import { FiCalendar, FiMapPin, FiClock, FiExternalLink, FiChevronRight, FiTag } from 'react-icons/fi';
import { subscribeToEvents } from '../../firebase/services';
import './EventsPanel.css';

const CATEGORY_COLORS = {
    general: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe' },
    workshop: { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0' },
    hackathon: { bg: '#faf5ff', text: '#7c3aed', border: '#e9d5ff' },
    cultural: { bg: '#fff7ed', text: '#c2410c', border: '#fed7aa' },
    sports: { bg: '#ecfdf5', text: '#059669', border: '#a7f3d0' },
    seminar: { bg: '#fef3c7', text: '#b45309', border: '#fde68a' },
    fest: { bg: '#fdf2f8', text: '#be185d', border: '#fbcfe8' },
};

function formatEventDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

function isUpcoming(dateStr) {
    if (!dateStr) return true;
    return new Date(dateStr) >= new Date(new Date().toDateString());
}

function daysUntil(dateStr) {
    if (!dateStr) return null;
    const diff = new Date(dateStr) - new Date(new Date().toDateString());
    const days = Math.round(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Today!';
    if (days === 1) return 'Tomorrow';
    if (days < 0) return null;
    return `In ${days} days`;
}

export default function EventsPanel() {
    const [events, setEvents] = useState([]);
    const [expanded, setExpanded] = useState(null);

    useEffect(() => {
        const unsub = subscribeToEvents((data) => {
            // Priority: Only show events explicitly pinned by Admin on the sidebar
            const pinned = data.filter(e => e.isPinned && isUpcoming(e.eventDate));
            setEvents(pinned);
        });
        return () => unsub();
    }, []);

    if (events.length === 0) return null;

    return (
        <section className="events-panel" aria-label="Featured Events">
            <div className="events-panel-header">
                <div className="events-panel-title">
                    <span className="events-panel-icon">📌</span>
                    <h3>Featured Events</h3>
                </div>
                <span className="events-panel-count">{events.length}</span>
            </div>

            <div className="events-list">
                {events.map((event) => {
                    const catStyle = CATEGORY_COLORS[event.category] || CATEGORY_COLORS.general;
                    const countdown = daysUntil(event.eventDate);
                    const isOpen = expanded === event.id;

                    return (
                        <article
                            key={event.id}
                            className={`event-card ${isOpen ? 'expanded' : ''}`}
                            onClick={() => setExpanded(isOpen ? null : event.id)}
                        >
                            {event.bannerUrl && (
                                <div className="event-banner-wrap">
                                    <img
                                        src={event.bannerUrl}
                                        alt={event.title}
                                        className="event-banner-img"
                                        loading="lazy"
                                    />
                                    {countdown && (
                                        <span className={`event-countdown-badge ${countdown === 'Today!' ? 'today' : ''}`}>
                                            {countdown}
                                        </span>
                                    )}
                                </div>
                            )}

                            <div className="event-card-body">
                                <div className="event-card-top">
                                    <span
                                        className="event-category-badge"
                                        style={{ background: catStyle.bg, color: catStyle.text, borderColor: catStyle.border }}
                                    >
                                        <FiTag size={10} />
                                        {event.category || 'General'}
                                    </span>
                                    {!event.bannerUrl && countdown && (
                                        <span className={`event-countdown-badge inline ${countdown === 'Today!' ? 'today' : ''}`}>
                                            {countdown}
                                        </span>
                                    )}
                                </div>

                                <h4 className="event-card-title">{event.title}</h4>

                                {event.caption && (
                                    <p className="event-card-caption">{event.caption}</p>
                                )}

                                <div className="event-meta-row">
                                    <span className="event-meta-item">
                                        <FiCalendar size={12} />
                                        {formatEventDate(event.eventDate)}
                                    </span>
                                    {event.eventTime && (
                                        <span className="event-meta-item">
                                            <FiClock size={12} />
                                            {event.eventTime}
                                        </span>
                                    )}
                                </div>

                                {event.location && (
                                    <div className="event-meta-row">
                                        <span className="event-meta-item">
                                            <FiMapPin size={12} />
                                            {event.location}
                                        </span>
                                    </div>
                                )}

                                {isOpen && event.description && (
                                    <p className="event-card-desc">{event.description}</p>
                                )}

                                <div className="event-card-footer">
                                    {event.registrationLink ? (
                                        <a
                                            href={event.registrationLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="event-register-btn"
                                            onClick={e => e.stopPropagation()}
                                        >
                                            Register <FiExternalLink size={12} />
                                        </a>
                                    ) : <span />}
                                    <button className="event-expand-btn">
                                        {isOpen ? 'Less' : 'More'} <FiChevronRight size={12} style={{ transform: isOpen ? 'rotate(90deg)' : 'none', transition: '0.2s' }} />
                                    </button>
                                </div>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}
