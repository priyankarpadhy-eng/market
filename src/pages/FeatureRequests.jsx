import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, updateDoc, doc, increment, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { FiThumbsUp, FiPlus, FiClock, FiX, FiCheckCircle, FiLoader, FiAlertCircle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import './FeatureRequests.css';

export default function FeatureRequests() {
    const { currentUser } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const q = query(collection(db, 'featureRequests'), orderBy('votes', 'desc'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const reqs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setRequests(reqs);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title.trim() || !description.trim()) {
            setError('Title and description are required.');
            return;
        }

        setSubmitting(true);
        setError('');
        try {
            await addDoc(collection(db, 'featureRequests'), {
                title,
                description,
                votes: 0,
                voterIds: [],
                status: 'pending',
                authorId: currentUser?.uid || 'guest',
                authorName: currentUser?.displayName || 'Anonymous',
                createdAt: serverTimestamp(),
            });
            setShowModal(false);
            setTitle('');
            setDescription('');
        } catch (err) {
            setError('Failed to submit feature request. Try again.');
            console.error(err);
        }
        setSubmitting(false);
    };

    const handleVote = async (requestId) => {
        if (!currentUser) return;

        const reqRef = doc(db, 'featureRequests', requestId);
        const reqSnap = await getDoc(reqRef);

        if (reqSnap.exists()) {
            const data = reqSnap.data();
            const hasVoted = data.voterIds?.includes(currentUser.uid);

            if (hasVoted) {
                await updateDoc(reqRef, {
                    votes: increment(-1),
                    voterIds: arrayRemove(currentUser.uid)
                });
            } else {
                await updateDoc(reqRef, {
                    votes: increment(1),
                    voterIds: arrayUnion(currentUser.uid)
                });
            }
        }
    };

    const getStatusConfig = (status) => {
        switch (status) {
            case 'completed': return { icon: <FiCheckCircle />, label: 'Completed', bg: '#dcfce7', color: '#15803d' };
            case 'in-progress': return { icon: <FiLoader />, label: 'In Progress', bg: '#dbeafe', color: '#1d4ed8' };
            default: return { icon: <FiAlertCircle />, label: 'Pending', bg: '#fef3c7', color: '#b45309' };
        }
    };

    const formatTime = (timestamp) => {
        if (!timestamp?.toDate) return 'Just now';
        const d = timestamp.toDate();
        return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) + ' • ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="features-page animate-fadeIn">
            <div className="features-header">
                <div>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 6px 0' }}>Feature Requests</h1>
                    <p style={{ color: '#64748b', fontSize: '0.95rem', margin: 0 }}>Help shape the future of the platform by suggesting and voting on ideas.</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    className="create-feature-btn"
                    onClick={() => {
                        if (!currentUser || currentUser.isAnonymous) {
                            setError('You must be logged in to suggest features (not a guest).');
                            return;
                        }
                        setShowModal(true);
                    }}
                    style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '12px 24px', background: 'var(--primary)', color: 'white',
                        border: 'none', borderRadius: '12px', fontWeight: 700,
                        fontSize: '0.95rem', cursor: 'pointer',
                        boxShadow: '0 4px 14px rgba(79, 70, 229, 0.3)'
                    }}
                >
                    <FiPlus /> Suggest Feature
                </motion.button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px', marginTop: '28px' }}>
                {loading ? (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: '#94a3b8' }}>Loading requests...</div>
                ) : requests.length === 0 ? (
                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
                        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>💡</div>
                        No feature requests yet. Be the first to suggest one!
                    </div>
                ) : (
                    <AnimatePresence>
                        {requests.map((req, i) => {
                            const status = getStatusConfig(req.status);
                            const hasVoted = req.voterIds?.includes(currentUser?.uid);
                            return (
                                <motion.div
                                    key={req.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.3, delay: i * 0.05 }}
                                    style={{
                                        background: 'var(--bg-white)',
                                        border: '1px solid var(--border-light)',
                                        borderRadius: '16px',
                                        padding: '24px',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '16px',
                                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                                        transition: 'box-shadow 0.2s, transform 0.2s',
                                        cursor: 'default'
                                    }}
                                    whileHover={{ boxShadow: '0 8px 25px rgba(0,0,0,0.08)', y: -2 }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <div style={{ flex: 1 }}>
                                            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>{req.title}</h3>
                                            <span style={{
                                                display: 'inline-flex', alignItems: 'center', gap: '5px',
                                                padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem',
                                                fontWeight: 700, background: status.bg, color: status.color
                                            }}>
                                                {status.icon} {status.label}
                                            </span>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => handleVote(req.id)}
                                            style={{
                                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                                                padding: '10px 14px', borderRadius: '12px',
                                                border: hasVoted ? '2px solid #4f46e5' : '1px solid #e2e8f0',
                                                background: hasVoted ? '#eef2ff' : 'white',
                                                color: hasVoted ? '#4f46e5' : '#64748b',
                                                cursor: 'pointer', transition: 'all 0.15s',
                                                minWidth: '54px'
                                            }}
                                        >
                                            <FiThumbsUp size={18} />
                                            <span style={{ fontWeight: 800, fontSize: '1rem' }}>{req.votes}</span>
                                        </motion.button>
                                    </div>

                                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569', lineHeight: 1.6 }}>{req.description}</p>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                                        <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 500 }}>
                                            by <span style={{ color: '#64748b', fontWeight: 600 }}>{req.authorName}</span>
                                        </span>
                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <FiClock size={12} /> {formatTime(req.createdAt)}
                                        </span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                )}
            </div>

            <AnimatePresence>
                {showModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ y: 50, opacity: 0, scale: 0.95 }}
                            animate={{ y: 0, opacity: 1, scale: 1 }}
                            exit={{ y: 50, opacity: 0, scale: 0.95 }}
                            onClick={e => e.stopPropagation()}
                            style={{ background: 'white', borderRadius: '20px', padding: '32px', width: '100%', maxWidth: '480px', boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>💡 Suggest a Feature</h2>
                                <button onClick={() => setShowModal(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                    <FiX size={18} />
                                </button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                {error && <div style={{ padding: '10px', background: '#fee2e2', color: '#dc2626', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem' }}>{error}</div>}
                                <div style={{ marginBottom: '16px' }}>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>Title</label>
                                    <input
                                        type="text"
                                        placeholder="Short, descriptive title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        maxLength={60}
                                        style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box' }}
                                    />
                                </div>
                                <div style={{ marginBottom: '24px' }}>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>Description</label>
                                    <textarea
                                        placeholder="What problem does this solve? How should it work?"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={5}
                                        style={{ width: '100%', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.95rem', outline: 'none', resize: 'vertical', boxSizing: 'border-box', fontFamily: 'inherit' }}
                                    />
                                </div>
                                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                    <button type="button" onClick={() => setShowModal(false)} style={{ padding: '12px 24px', borderRadius: '10px', border: '1px solid #e2e8f0', background: 'white', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem' }}>Cancel</button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={submitting}
                                        style={{ padding: '12px 24px', borderRadius: '10px', border: 'none', background: '#4f46e5', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem', boxShadow: '0 4px 12px rgba(79,70,229,0.3)' }}
                                    >
                                        {submitting ? 'Submitting...' : 'Submit Suggestion'}
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
