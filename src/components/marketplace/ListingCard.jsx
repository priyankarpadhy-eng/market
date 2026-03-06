import { useState, useEffect } from 'react';
import { FiHeart, FiClock, FiTrash2, FiMapPin, FiPhone, FiMessageCircle, FiX, FiSend } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { favoriteListing, deleteListing, subscribeToListingComments, addListingComment, addListingReply, deleteListingComment } from '../../firebase/services';
import { useAuth } from '../../contexts/AuthContext';
import './ListingCard.css';

export default function ListingCard({ listing, index = 0 }) {
    const { currentUser, isAdmin } = useAuth();
    const [favorite, setFavorite] = useState(false);
    const [showDetails, setShowDetails] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [isSeller, setIsSeller] = useState(false);

    useEffect(() => {
        setIsSeller(currentUser?.uid === listing.sellerId);
    }, [currentUser, listing.sellerId]);

    useEffect(() => {
        if (!showDetails) return;
        const unsubscribe = subscribeToListingComments(listing.id, (data) => {
            setComments(data);
        });
        return () => unsubscribe();
    }, [showDetails, listing.id]);

    const toggleFavorite = async (e) => {
        e.stopPropagation();
        setFavorite(!favorite);
        if (!favorite) {
            try { await favoriteListing(listing.id); } catch { }
        }
    };

    const handleComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            await addListingComment(listing.id, {
                author: currentUser?.displayName || 'Guest',
                text: newComment.trim(),
            });
            setNewComment('');
        } catch (err) {
            console.error("Error posting comment", err);
        }
    };

    const handleReply = async (commentId) => {
        if (!replyText.trim()) return;
        try {
            await addListingReply(listing.id, commentId, {
                author: listing.seller,
                text: replyText.trim(),
            });
            setReplyText('');
            setReplyingTo(null);
        } catch (err) {
            console.error("Error posting reply", err);
        }
    };

    const handleDeleteComment = async (commentId) => {
        if (!window.confirm("Delete this comment?")) return;
        try {
            await deleteListingComment(listing.id, commentId);
        } catch (err) {
            console.error("Error deleting comment", err);
        }
    };

    const getInitials = (name) => {
        return (name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    };

    const timeString = listing.createdAt?.toDate ? listing.createdAt.toDate().toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Just now';

    return (
        <>
            <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="listing-card"
                onClick={() => setShowDetails(true)}
            >
                <div className="listing-card-image-wrapper">
                    <img
                        src={listing.image}
                        alt={listing.title}
                        className="listing-card-image"
                        loading="lazy"
                    />
                    <span className={`listing-card-category ${listing.category.toLowerCase()}`}>
                        {listing.category}
                    </span>
                    <button
                        className={`listing-card-fav ${favorite ? 'active' : ''}`}
                        onClick={toggleFavorite}
                        aria-label="Favorite"
                    >
                        <FiHeart fill={favorite ? '#ef4444' : 'none'} />
                    </button>
                    {listing.condition && (
                        <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>
                            {listing.condition}
                        </div>
                    )}
                </div>
                <div className="listing-card-body">
                    <div className="listing-card-title-row">
                        <span className="listing-card-title" title={listing.title}>{listing.title}</span>
                        <span className="listing-card-price" style={{ color: '#059669', fontSize: '1.2rem', fontWeight: 800 }}>₹{listing.price}</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                        {listing.location && (
                            <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <FiMapPin /> {listing.location}
                            </div>
                        )}
                        <div style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <FiClock /> {timeString}
                        </div>
                    </div>

                    <div className="listing-card-footer" style={{ marginTop: '12px' }}>
                        <div className="listing-card-seller">
                            <div className="listing-card-seller-avatar">
                                {getInitials(listing.seller)}
                            </div>
                            <span className="listing-card-seller-name">{listing.seller}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {isAdmin && (
                                <button className="listing-card-details-btn" style={{ background: '#fee2e2', color: '#ef4444', padding: '8px', border: 'none', borderRadius: '8px', display: 'flex' }} onClick={async (e) => {
                                    e.stopPropagation();
                                    if (window.confirm("Admin: Permanently delete this listing?")) {
                                        await deleteListing(listing.id);
                                    }
                                }}>
                                    <FiTrash2 size={14} />
                                </button>
                            )}
                            <button
                                className="listing-card-details-btn"
                                style={{
                                    background: 'var(--primary-lighter)',
                                    color: 'var(--primary)',
                                    padding: '6px 12px',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontWeight: 700,
                                    fontSize: '0.75rem'
                                }}
                            >
                                View Details
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Expando Modal for Item Details & Comments */}
            <AnimatePresence>
                {showDetails && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="profile-modal-overlay"
                        onClick={() => setShowDetails(false)}
                        style={{ zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <motion.div
                            initial={{ y: 50, opacity: 0, scale: 0.95 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: 50, opacity: 0, scale: 0.95 }}
                            className="profile-modal"
                            onClick={e => e.stopPropagation()}
                            style={{ width: '90%', maxWidth: '800px', padding: '0', display: 'flex', height: '80vh', overflow: 'hidden', borderRadius: '16px' }}
                        >
                            {/* Left Side: Product Details */}
                            <div style={{ flex: '1.2', background: '#f8fafc', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
                                <div style={{ width: '100%', height: '300px', background: '#e2e8f0', position: 'relative' }}>
                                    <img src={listing.image} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#000' }} />
                                    <button onClick={() => setShowDetails(false)} style={{ position: 'absolute', top: '16px', left: '16px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                        <FiX size={20} />
                                    </button>
                                </div>
                                <div style={{ padding: '24px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                        <div>
                                            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0', lineHeight: '1.2' }}>{listing.title}</h2>
                                            <span style={{ display: 'inline-block', background: '#e0e7ff', color: '#4f46e5', padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>
                                                {listing.category}
                                            </span>
                                        </div>
                                        <div style={{ fontSize: '2rem', fontWeight: 900, color: '#059669' }}>₹{listing.price}</div>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px', padding: '16px', background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                                        <div>
                                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Condition</p>
                                            <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>{listing.condition}</p>
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Location</p>
                                            <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                <FiMapPin /> {listing.location || 'N/A'}
                                            </p>
                                        </div>
                                        <div style={{ gridColumn: '1 / -1' }}>
                                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Contact Number</p>
                                            <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', color: '#4f46e5' }}>
                                                <FiPhone /> {listing.mobileNumber ? <a href={`tel:${listing.mobileNumber}`} style={{ color: 'inherit', textDecoration: 'none' }}>{listing.mobileNumber}</a> : 'Not provided'}
                                            </p>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px' }}>Description</h4>
                                        <p style={{ fontSize: '0.95rem', color: '#475569', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap' }}>
                                            {listing.description || 'No description provided.'}
                                        </p>
                                    </div>

                                    <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', fontWeight: 'bold', color: 'white' }}>
                                            {getInitials(listing.seller)}
                                        </div>
                                        <div>
                                            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>Sold by</p>
                                            <p style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{listing.seller}</p>
                                            <p style={{ margin: 0, fontSize: '0.7rem', color: '#94a3b8' }}>Listed • {timeString}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Side: Comments */}
                            <div style={{ flex: '0.8', background: 'white', display: 'flex', flexDirection: 'column', borderLeft: '1px solid #e2e8f0' }}>
                                <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <FiMessageCircle /> Questions & Comments
                                    </h3>
                                </div>
                                <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {comments.length === 0 ? (
                                        <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '40px', fontSize: '0.9rem' }}>No comments yet. Be the first to ask!</div>
                                    ) : (
                                        comments.map(c => (
                                            <div key={c.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <div style={{ display: 'flex', gap: '12px' }}>
                                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 'bold', color: '#64748b', flexShrink: 0 }}>
                                                        {getInitials(c.author)}
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                                                                <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{c.author}</span>
                                                                <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                                                                    {c.createdAt?.toDate ? c.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                                                                </span>
                                                            </div>
                                                            {(isAdmin || isSeller) && (
                                                                <button onClick={() => handleDeleteComment(c.id)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }} title="Delete Comment">
                                                                    <FiTrash2 size={12} />
                                                                </button>
                                                            )}
                                                        </div>
                                                        <p style={{ margin: '4px 0', fontSize: '0.9rem', color: '#334155', lineHeight: '1.4' }}>{c.text}</p>
                                                        {isSeller && (
                                                            <button onClick={() => setReplyingTo(replyingTo === c.id ? null : c.id)} style={{ background: 'none', border: 'none', color: '#4f46e5', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', padding: 0 }}>
                                                                {replyingTo === c.id ? 'Cancel' : 'Reply to User'}
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Replies */}
                                                {(c.replies && c.replies.length > 0) && (
                                                    <div style={{ marginLeft: '44px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                        {c.replies.map((reply, i) => (
                                                            <div key={i} style={{ display: 'flex', gap: '8px', padding: '8px', background: '#f8fafc', borderRadius: '8px', borderLeft: '3px solid #4f46e5' }}>
                                                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#4f46e5', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 'bold', flexShrink: 0 }}>
                                                                    {getInitials(reply.author)}
                                                                </div>
                                                                <div style={{ flex: 1 }}>
                                                                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                                                                        <span style={{ fontWeight: 800, fontSize: '0.8rem', color: '#1e293b' }}>{reply.author} <span style={{ fontWeight: 400, color: '#64748b', fontSize: '0.7rem' }}>(Seller)</span></span>
                                                                    </div>
                                                                    <p style={{ margin: '2px 0 0 0', fontSize: '0.85rem', color: '#475569' }}>{reply.text}</p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Reply Input */}
                                                {replyingTo === c.id && (
                                                    <div style={{ marginLeft: '44px', marginTop: '4px' }}>
                                                        <div style={{ display: 'flex', gap: '8px' }}>
                                                            <input
                                                                type="text"
                                                                placeholder="Type your reply..."
                                                                value={replyText}
                                                                onChange={(e) => setReplyText(e.target.value)}
                                                                style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.85rem', outline: 'none' }}
                                                                autoFocus
                                                                onKeyDown={(e) => e.key === 'Enter' && handleReply(c.id)}
                                                            />
                                                            <button
                                                                onClick={() => handleReply(c.id)}
                                                                disabled={!replyText.trim()}
                                                                style={{ padding: '0 12px', borderRadius: '8px', background: '#4f46e5', color: 'white', border: 'none', fontWeight: 600, fontSize: '0.8rem', cursor: replyText.trim() ? 'pointer' : 'not-allowed' }}
                                                            >
                                                                Reply
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div style={{ padding: '16px', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
                                    <form onSubmit={handleComment} style={{ display: 'flex', gap: '8px' }}>
                                        <input
                                            type="text"
                                            placeholder="Ask a question..."
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            style={{ flex: 1, padding: '10px 14px', borderRadius: '20px', border: '1px solid #cbd5e1', outline: 'none' }}
                                        />
                                        <button
                                            type="submit"
                                            disabled={!newComment.trim()}
                                            style={{ background: newComment.trim() ? '#4f46e5' : '#cbd5e1', color: 'white', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: newComment.trim() ? 'pointer' : 'not-allowed', transition: 'background 0.2s' }}
                                        >
                                            <FiSend size={16} />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
