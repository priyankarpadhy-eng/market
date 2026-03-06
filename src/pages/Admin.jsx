import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiShield, FiTrash2, FiUsers, FiShoppingBag, FiLayers, FiCalendar, FiPlus, FiX, FiMapPin, FiClock, FiLink, FiImage, FiEdit2, FiSearch, FiUserCheck, FiUserX, FiAward } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { getAllPostsForAdmin, getAllListingsForAdmin, getAllUsers, deletePost, deleteListing, getReportedPosts, dismissReport, resolveReport, getEvents, createEvent, deleteEvent, updateEvent, searchUserByEmail, setUserRole } from '../firebase/services';
import { uploadFile } from '../lib/storage';
import './Admin.css';

const EMPTY_EVENT = { title: '', caption: '', description: '', location: '', eventDate: '', eventTime: '', category: 'general', registrationLink: '' };
const CATEGORIES = ['general', 'workshop', 'hackathon', 'cultural', 'sports', 'seminar', 'fest'];

export default function Admin() {
    const { isAdmin, isFounder, currentUser } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('posts');
    const [posts, setPosts] = useState([]);
    const [listings, setListings] = useState([]);
    const [users, setUsers] = useState([]);
    const [reports, setReports] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    // Users tab search
    const [userSearch, setUserSearch] = useState('');

    // Founder role management
    const [roleEmail, setRoleEmail] = useState('');
    const [roleSearchResult, setRoleSearchResult] = useState(null);
    const [roleSearching, setRoleSearching] = useState(false);
    const [roleSearchError, setRoleSearchError] = useState('');
    const [roleSaving, setRoleSaving] = useState(false);
    const [roleMsg, setRoleMsg] = useState('');
    // Event form state
    const [showEventForm, setShowEventForm] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [eventForm, setEventForm] = useState(EMPTY_EVENT);
    const [bannerFile, setBannerFile] = useState(null);
    const [bannerPreview, setBannerPreview] = useState('');
    const [eventSaving, setEventSaving] = useState(false);
    const [eventError, setEventError] = useState('');

    useEffect(() => {
        if (!isAdmin) { navigate('/'); return; }
        async function fetchAdminData() {
            setLoading(true);
            try {
                if (activeTab === 'posts') setPosts(await getAllPostsForAdmin());
                else if (activeTab === 'listings') setListings(await getAllListingsForAdmin());
                else if (activeTab === 'users') setUsers(await getAllUsers());
                else if (activeTab === 'reports') setReports(await getReportedPosts());
                else if (activeTab === 'events') setEvents(await getEvents());
            } catch (err) { console.error('Admin fetch error:', err); }
            finally { setLoading(false); }
        }
        fetchAdminData();
    }, [isAdmin, navigate, activeTab]);

    const handleRoleSearch = async () => {
        if (!roleEmail.trim()) return;
        setRoleSearching(true);
        setRoleSearchError('');
        setRoleSearchResult(null);
        setRoleMsg('');
        try {
            const found = await searchUserByEmail(roleEmail);
            if (!found) setRoleSearchError('No user found with that email.');
            else if (found.uid === currentUser?.uid) setRoleSearchError('You cannot change your own role.');
            else setRoleSearchResult(found);
        } catch (err) { setRoleSearchError('Search failed. Try again.'); }
        setRoleSearching(false);
    };

    const handleSetRole = async (uid, newRole) => {
        if (!window.confirm(`Set this user's role to "${newRole}"?`)) return;
        setRoleSaving(true);
        try {
            await setUserRole(uid, newRole);
            setRoleSearchResult(prev => ({ ...prev, role: newRole }));
            setUsers(prev => prev.map(u => u.uid === uid ? { ...u, role: newRole } : u));
            setRoleMsg(`✓ Role updated to "${newRole}" successfully.`);
        } catch (err) { setRoleMsg('✗ Failed to update role. Check Firestore rules.'); }
        setRoleSaving(false);
    };

    const handleDeletePost = async (id) => {
        if (!window.confirm('Permanently delete this post?')) return;
        try { await deletePost(id); setPosts(posts.filter(p => p.id !== id)); }
        catch (err) { alert('Failed to delete post.'); }
    };

    const handleDeleteListing = async (id) => {
        if (!window.confirm('Permanently delete this listing?')) return;
        try { await deleteListing(id); setListings(listings.filter(l => l.id !== id)); }
        catch (err) { alert('Failed to delete listing.'); }
    };

    const handleDismissReport = async (reportId) => {
        try { await dismissReport(reportId); setReports(reports.filter(r => r.id !== reportId)); }
        catch { alert('Failed to dismiss report.'); }
    };

    const handleResolveReport = async (reportId) => {
        try { await resolveReport(reportId); setReports(reports.map(r => r.id === reportId ? { ...r, status: 'resolved' } : r)); }
        catch { alert('Failed to resolve report.'); }
    };

    const handleDeleteEvent = async (id) => {
        if (!window.confirm('Permanently delete this event?')) return;
        try { await deleteEvent(id); setEvents(events.filter(e => e.id !== id)); }
        catch { alert('Failed to delete event.'); }
    };

    const openCreateEvent = () => {
        setEditingEvent(null);
        setEventForm(EMPTY_EVENT);
        setBannerFile(null);
        setBannerPreview('');
        setEventError('');
        setShowEventForm(true);
    };

    const openEditEvent = (event) => {
        setEditingEvent(event);
        setEventForm({
            title: event.title || '',
            caption: event.caption || '',
            description: event.description || '',
            location: event.location || '',
            eventDate: event.eventDate || '',
            eventTime: event.eventTime || '',
            category: event.category || 'general',
            registrationLink: event.registrationLink || '',
        });
        setBannerFile(null);
        setBannerPreview(event.bannerUrl || '');
        setEventError('');
        setShowEventForm(true);
    };

    const handleBannerChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setBannerFile(file);
        setBannerPreview(URL.createObjectURL(file));
    };

    const handleSaveEvent = async () => {
        if (!eventForm.title.trim()) { setEventError('Event title is required.'); return; }
        if (!eventForm.eventDate) { setEventError('Event date is required.'); return; }
        setEventSaving(true);
        setEventError('');
        try {
            let bannerUrl = editingEvent?.bannerUrl || '';
            if (bannerFile) {
                bannerUrl = await uploadFile(bannerFile, 'events');
            }
            const payload = { ...eventForm, bannerUrl, createdBy: currentUser?.uid };
            if (editingEvent) {
                await updateEvent(editingEvent.id, payload);
                setEvents(events.map(e => e.id === editingEvent.id ? { ...e, ...payload } : e));
            } else {
                const ref = await createEvent(payload);
                setEvents([...events, { id: ref.id, ...payload }]);
            }
            setShowEventForm(false);
        } catch (err) {
            console.error(err);
            setEventError('Failed to save event. Check console for details.');
        }
        setEventSaving(false);
    };

    if (!isAdmin) return null;

    return (
        <div className="admin-page">
            <div className="admin-header">
                <h2><FiShield /> Admin Control Panel</h2>
                <p>Manage platform content, moderate posts, and oversee users.</p>
            </div>

            <div className="admin-tabs">
                <button className={`admin-tab ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => setActiveTab('posts')}><FiLayers /> All Posts</button>
                <button className={`admin-tab ${activeTab === 'listings' ? 'active' : ''}`} onClick={() => setActiveTab('listings')}><FiShoppingBag /> Marketplace</button>
                <button className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}><FiUsers /> Users</button>
                <button className={`admin-tab ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}><FiShield color="#ef4444" /> Reports</button>
                <button className={`admin-tab ${activeTab === 'events' ? 'active' : ''}`} onClick={() => setActiveTab('events')}><FiCalendar color="#667eea" /> Events</button>
                {isFounder && (
                    <button className={`admin-tab founder-tab ${activeTab === 'roles' ? 'active' : ''}`} onClick={() => setActiveTab('roles')}>
                        <FiAward /> Role Manager
                    </button>
                )}
            </div>

            <div className="admin-content">
                {loading ? (
                    <div className="admin-loading">Loading system data...</div>
                ) : (
                    <>
                        {activeTab === 'posts' && (
                            <table className="admin-table">
                                <thead><tr><th>Title/Tag</th><th>Author</th><th>Votes</th><th>Date</th><th>Action</th></tr></thead>
                                <tbody>
                                    {posts.map(post => {
                                        const pTime = post.createdAt?.seconds ? new Date(post.createdAt.seconds * 1000).toLocaleDateString() : 'N/A';
                                        return (
                                            <tr key={post.id}>
                                                <td>{post.title || `[${post.tag}]`}</td>
                                                <td>{post.authorName || post.author}</td>
                                                <td>{post.votes}</td>
                                                <td>{pTime}</td>
                                                <td><button className="admin-delete-btn" onClick={() => handleDeletePost(post.id)}><FiTrash2 /> Delete</button></td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        )}

                        {activeTab === 'listings' && (
                            <table className="admin-table">
                                <thead><tr><th>Item</th><th>Category</th><th>Price</th><th>Action</th></tr></thead>
                                <tbody>
                                    {listings.map(listing => (
                                        <tr key={listing.id}>
                                            <td>{listing.title}</td>
                                            <td>{listing.category}</td>
                                            <td>₹{listing.price}</td>
                                            <td><button className="admin-delete-btn" onClick={() => handleDeleteListing(listing.id)}><FiTrash2 /> Delete</button></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {activeTab === 'users' && (
                            <div>
                                {/* Email Search Bar */}
                                <div className="admin-user-search-bar">
                                    <FiSearch />
                                    <input
                                        type="text"
                                        placeholder="Search users by name or email…"
                                        value={userSearch}
                                        onChange={e => setUserSearch(e.target.value)}
                                    />
                                    {userSearch && (
                                        <button onClick={() => setUserSearch('')} className="admin-search-clear"><FiX /></button>
                                    )}
                                </div>
                                <table className="admin-table">
                                    <thead><tr><th>Display Name</th><th>Email</th><th>Role</th><th>University</th></tr></thead>
                                    <tbody>
                                        {users
                                            .filter(u => !userSearch ||
                                                u.displayName?.toLowerCase().includes(userSearch.toLowerCase()) ||
                                                u.email?.toLowerCase().includes(userSearch.toLowerCase())
                                            )
                                            .map(user => (
                                                <tr key={user.uid || user.id}>
                                                    <td>{user.displayName}</td>
                                                    <td>{user.email || 'N/A'}</td>
                                                    <td>
                                                        <span className={`admin-role-badge ${user.role === 'admin' ? 'admin' : user.role === 'founder' ? 'founder' : ''}`}>
                                                            {user.role === 'founder' && <FiAward size={10} />} {user.role || 'user'}
                                                        </span>
                                                    </td>
                                                    <td>{user.university || 'N/A'}</td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {activeTab === 'reports' && (
                            <table className="admin-table">
                                <thead><tr><th>Post</th><th>Reason</th><th>Author</th><th>Reporter</th><th>Status</th><th>Action</th></tr></thead>
                                <tbody>
                                    {reports.map(report => (
                                        <tr key={report.id}>
                                            <td><a href={`/post/${report.postId}`} target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: 600 }}>{report.postTitle || 'View Post'}</a></td>
                                            <td><span style={{ color: '#ef4444', fontWeight: 600 }}>{report.reason}</span></td>
                                            <td>{report.postAuthor}</td>
                                            <td>{report.reporterName}</td>
                                            <td><span className={`admin-role-badge ${report.status === 'resolved' ? 'active' : 'pending'}`}>{report.status}</span></td>
                                            <td>
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    {report.status !== 'resolved' && (
                                                        <button className="admin-delete-btn" style={{ background: '#10b981' }} onClick={() => handleResolveReport(report.id)}>Resolve</button>
                                                    )}
                                                    <button className="admin-delete-btn" onClick={() => handleDismissReport(report.id)}>Dismiss</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}

                        {activeTab === 'events' && (
                            <div>
                                {/* Header + Create Button */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                                        Campus Events ({events.length})
                                    </h3>
                                    <button className="admin-create-event-btn" onClick={openCreateEvent}>
                                        <FiPlus /> Add Event
                                    </button>
                                </div>

                                {/* Event Cards Grid */}
                                {events.length === 0 ? (
                                    <div className="admin-empty-state">
                                        <FiCalendar size={32} />
                                        <p>No events yet. Create one to get started!</p>
                                    </div>
                                ) : (
                                    <div className="admin-events-grid">
                                        {events.map(event => (
                                            <div key={event.id} className="admin-event-card">
                                                {event.bannerUrl && (
                                                    <div className="admin-event-banner">
                                                        <img src={event.bannerUrl} alt={event.title} />
                                                    </div>
                                                )}
                                                <div className="admin-event-card-body">
                                                    <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                                                        <span className="admin-event-cat-badge">{event.category}</span>
                                                    </div>
                                                    <h4>{event.title}</h4>
                                                    {event.caption && <p className="admin-event-caption">{event.caption}</p>}
                                                    <div className="admin-event-meta">
                                                        <span><FiCalendar size={12} /> {new Date(event.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                        {event.eventTime && <span><FiClock size={12} /> {event.eventTime}</span>}
                                                        {event.location && <span><FiMapPin size={12} /> {event.location}</span>}
                                                    </div>
                                                    <div className="admin-event-actions">
                                                        <button className="admin-edit-btn" onClick={() => openEditEvent(event)}><FiEdit2 /> Edit</button>
                                                        <button className="admin-delete-btn" onClick={() => handleDeleteEvent(event.id)}><FiTrash2 /> Delete</button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'roles' && isFounder && (
                            <div className="founder-role-panel">
                                <div className="founder-role-header">
                                    <div className="founder-role-title">
                                        <FiAward color="#f59e0b" size={20} />
                                        <div>
                                            <h3>Role Manager</h3>
                                            <p>Search a user by email and promote or demote their role.</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Search */}
                                <div className="founder-search-row">
                                    <div className="founder-search-input-wrap">
                                        <FiSearch />
                                        <input
                                            type="email"
                                            placeholder="Enter user email address…"
                                            value={roleEmail}
                                            onChange={e => { setRoleEmail(e.target.value); setRoleSearchError(''); setRoleMsg(''); }}
                                            onKeyDown={e => e.key === 'Enter' && handleRoleSearch()}
                                        />
                                    </div>
                                    <button className="founder-search-btn" onClick={handleRoleSearch} disabled={roleSearching}>
                                        {roleSearching ? 'Searching…' : <><FiSearch /> Search</>}
                                    </button>
                                </div>

                                {roleSearchError && (
                                    <div className="founder-msg error">{roleSearchError}</div>
                                )}
                                {roleMsg && (
                                    <div className={`founder-msg ${roleMsg.startsWith('✓') ? 'success' : 'error'}`}>{roleMsg}</div>
                                )}

                                {/* Result Card */}
                                {roleSearchResult && (
                                    <div className="founder-user-result">
                                        <img
                                            src={roleSearchResult.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marketplace'}
                                            alt={roleSearchResult.displayName}
                                            className="founder-result-avatar"
                                        />
                                        <div className="founder-result-info">
                                            <div className="founder-result-name">{roleSearchResult.displayName}</div>
                                            <div className="founder-result-email">{roleSearchResult.email}</div>
                                            <span className={`admin-role-badge ${roleSearchResult.role === 'admin' ? 'admin' : roleSearchResult.role === 'founder' ? 'founder' : ''}`}>
                                                {roleSearchResult.role === 'founder' && <FiAward size={10} />} {roleSearchResult.role || 'user'}
                                            </span>
                                        </div>
                                        <div className="founder-result-actions">
                                            {roleSearchResult.role !== 'admin' && roleSearchResult.role !== 'founder' && (
                                                <button
                                                    className="founder-promote-btn"
                                                    onClick={() => handleSetRole(roleSearchResult.uid || roleSearchResult.id, 'admin')}
                                                    disabled={roleSaving}
                                                >
                                                    <FiUserCheck size={14} /> Promote to Admin
                                                </button>
                                            )}
                                            {roleSearchResult.role === 'admin' && (
                                                <button
                                                    className="founder-demote-btn"
                                                    onClick={() => handleSetRole(roleSearchResult.uid || roleSearchResult.id, 'user')}
                                                    disabled={roleSaving}
                                                >
                                                    <FiUserX size={14} /> Revoke Admin
                                                </button>
                                            )}
                                            {roleSearchResult.role === 'user' || !roleSearchResult.role ? null : null}
                                        </div>
                                    </div>
                                )}

                                {/* All users quick view */}
                                <div className="founder-all-admins">
                                    <h4>Current Admins & Founders</h4>
                                    <table className="admin-table">
                                        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Action</th></tr></thead>
                                        <tbody>
                                            {users.filter(u => u.role === 'admin' || u.role === 'founder').map(u => (
                                                <tr key={u.uid || u.id}>
                                                    <td>{u.displayName}</td>
                                                    <td>{u.email}</td>
                                                    <td>
                                                        <span className={`admin-role-badge ${u.role === 'admin' ? 'admin' : 'founder'}`}>
                                                            {u.role === 'founder' && <FiAward size={10} />} {u.role}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        {u.role === 'admin' && (u.uid || u.id) !== currentUser?.uid && (
                                                            <button className="founder-demote-btn small" onClick={() => handleSetRole(u.uid || u.id, 'user')} disabled={roleSaving}>
                                                                <FiUserX size={12} /> Revoke
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* ── EVENT FORM MODAL ── */}
            {showEventForm && (
                <div className="admin-modal-overlay" onClick={() => setShowEventForm(false)}>
                    <div className="admin-event-modal" onClick={e => e.stopPropagation()}>
                        <div className="admin-event-modal-header">
                            <h3>{editingEvent ? 'Edit Event' : 'Create New Event'}</h3>
                            <button onClick={() => setShowEventForm(false)} className="admin-modal-close"><FiX /></button>
                        </div>

                        <div className="admin-event-form">
                            {/* Banner Upload */}
                            <div className="admin-form-group">
                                <label>Banner Image</label>
                                <div className="admin-banner-upload" onClick={() => document.getElementById('event-banner-input').click()}>
                                    {bannerPreview ? (
                                        <img src={bannerPreview} alt="Banner preview" className="admin-banner-preview" />
                                    ) : (
                                        <div className="admin-banner-placeholder">
                                            <FiImage size={28} />
                                            <span>Click to upload banner image</span>
                                            <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>Recommended: 1200×400px</span>
                                        </div>
                                    )}
                                    <input id="event-banner-input" type="file" accept="image/*" onChange={handleBannerChange} style={{ display: 'none' }} />
                                </div>
                            </div>

                            <div className="admin-form-row">
                                <div className="admin-form-group">
                                    <label>Event Title *</label>
                                    <input type="text" placeholder="e.g. Tech Fest 2025" value={eventForm.title} onChange={e => setEventForm(f => ({ ...f, title: e.target.value }))} />
                                </div>
                                <div className="admin-form-group">
                                    <label>Category</label>
                                    <select value={eventForm.category} onChange={e => setEventForm(f => ({ ...f, category: e.target.value }))}>
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="admin-form-group">
                                <label>Caption / Tagline</label>
                                <input type="text" placeholder="Short catchy line shown on the card" value={eventForm.caption} onChange={e => setEventForm(f => ({ ...f, caption: e.target.value }))} />
                            </div>

                            <div className="admin-form-group">
                                <label>Full Description</label>
                                <textarea rows={4} placeholder="Detailed event description..." value={eventForm.description} onChange={e => setEventForm(f => ({ ...f, description: e.target.value }))} />
                            </div>

                            <div className="admin-form-row">
                                <div className="admin-form-group">
                                    <label>Event Date *</label>
                                    <input type="date" value={eventForm.eventDate} onChange={e => setEventForm(f => ({ ...f, eventDate: e.target.value }))} />
                                </div>
                                <div className="admin-form-group">
                                    <label>Event Time</label>
                                    <input type="time" value={eventForm.eventTime} onChange={e => setEventForm(f => ({ ...f, eventTime: e.target.value }))} />
                                </div>
                            </div>

                            <div className="admin-form-group">
                                <label><FiMapPin size={12} /> Location / Venue</label>
                                <input type="text" placeholder="e.g. Main Auditorium, IGIT Sarang" value={eventForm.location} onChange={e => setEventForm(f => ({ ...f, location: e.target.value }))} />
                            </div>

                            <div className="admin-form-group">
                                <label><FiLink size={12} /> Registration Link</label>
                                <input type="url" placeholder="https://forms.google.com/..." value={eventForm.registrationLink} onChange={e => setEventForm(f => ({ ...f, registrationLink: e.target.value }))} />
                            </div>

                            {eventError && (
                                <div className="admin-form-error">{eventError}</div>
                            )}

                            <div className="admin-event-modal-footer">
                                <button className="admin-cancel-btn" onClick={() => setShowEventForm(false)}>Cancel</button>
                                <button className="admin-save-event-btn" onClick={handleSaveEvent} disabled={eventSaving}>
                                    {eventSaving ? 'Saving…' : editingEvent ? 'Save Changes' : 'Publish Event'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
