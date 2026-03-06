import { useState, useEffect } from 'react';
import { FiTrendingUp, FiClock, FiAward, FiX, FiChevronLeft, FiChevronRight, FiPlus, FiBriefcase } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import PostCard from '../components/feed/PostCard';
import RightSidebar from '../components/feed/RightSidebar';
import FloatingPostButton from '../components/feed/FloatingPostButton';
import { subscribeToPosts, createPost } from '../firebase/services';
import { useAuth } from '../contexts/AuthContext';
import { uploadFile } from '../lib/storage';
import './Home.css';

const filters = [
    { id: 'trending', label: 'Trending', icon: FiTrendingUp },
    { id: 'new', label: 'New', icon: FiClock },
    { id: 'top', label: 'Top', icon: FiAward },
    { id: 'freelancing', label: 'Freelance', icon: FiBriefcase },
];

export default function Home() {
    const { currentUser } = useAuth();
    const [activeFilter, setActiveFilter] = useState('trending');
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    const [showWelcome, setShowWelcome] = useState(!hasSeenWelcome);
    const [currentStep, setCurrentStep] = useState(0);
    const [slideDir, setSlideDir] = useState(1);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newPost, setNewPost] = useState({ title: '', content: '', tag: 'discussion', textStyle: 'normal', budget: '', contact: '' });
    const [postFile, setPostFile] = useState(null);
    const [posting, setPosting] = useState(false);
    const [postError, setPostError] = useState('');

    const onboardingSteps = [
        {
            emoji: '👋',
            title: <>Welcome back, <br /><span style={{ color: 'var(--primary)' }}>{currentUser?.displayName?.split(' ')[0]}!</span></>,
            desc: "You're exactly where you belong. Dive in to see what IGIT Sarang is talking about today.",
            buttonText: "Next"
        },
        {
            emoji: '🤫',
            title: "Anonymous Confessions",
            desc: "You can post using Guest Login! No real name, no email, no password. Your privacy is in your hands.",
            buttonText: "Next"
        },
        {
            emoji: '🚀',
            title: "Connect & Trade",
            desc: "Buy, sell, join clubs, and connect with your branch. Your complete campus experience in one spot.",
            buttonText: "Explore Feed"
        }
    ];

    const handleNext = () => {
        if (currentStep < onboardingSteps.length - 1) {
            setSlideDir(1);
            setCurrentStep(prev => prev + 1);
        } else {
            localStorage.setItem('hasSeenWelcome', 'true');
            setShowWelcome(false);
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setSlideDir(-1);
            setCurrentStep(prev => prev - 1);
        }
    };

    useEffect(() => {
        let unsubscribe;
        try {
            unsubscribe = subscribeToPosts((firestorePosts) => {
                setPosts(firestorePosts || []);
                setLoading(false);
            });
        } catch (err) {
            console.log('Home subscription error:', err.message);
            setLoading(false);
        }
        return () => unsubscribe && unsubscribe();
    }, []);

    useEffect(() => {
        if (showCreateModal && !currentUser) {
            setNewPost(p => ({ ...p, tag: 'confession' }));
        }
    }, [showCreateModal, currentUser]);

    const handleCreatePost = async () => {
        if (!newPost.title || !newPost.content) {
            setPostError('Title and content are required.');
            return;
        }
        if (!currentUser && newPost.tag !== 'confession') {
            setPostError('Anonymous users can only post Confessions.');
            return;
        }
        setPosting(true);
        setPostError('');
        try {
            let imageUrl = '';
            if (postFile) {
                imageUrl = await uploadFile(postFile, 'posts');
            }
            await createPost({
                ...newPost,
                author: currentUser?.displayName || 'User',
                authorId: currentUser?.uid,
                image: imageUrl,
                timeAgo: 'Just now'
            });
            setShowCreateModal(false);
            setNewPost({ title: '', content: '', tag: 'discussion', textStyle: 'normal', budget: '', contact: '' });
            setPostFile(null);
        } catch (err) {
            setPostError(err.message);
        }
        setPosting(false);
    };

    // Client-side sorting and filtering based on filter
    const filteredAndSortedPosts = [...posts]
        .filter(post => {
            if (activeFilter === 'freelancing') return post.tag === 'freelancing';
            return true;
        })
        .sort((a, b) => {
            if (activeFilter === 'top') return (b.votes || 0) - (a.votes || 0);
            if (activeFilter === 'new') {
                const aTime = a.createdAt?.seconds || 0;
                const bTime = b.createdAt?.seconds || 0;
                return bTime - aTime;
            }
            return 0; // trending = default order
        });

    return (
        <div className="home-page">
            <FloatingPostButton />
            <div className="home-feed">
                <AnimatePresence>
                    {showWelcome && currentUser && !currentUser.isAnonymous && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            style={{
                                position: 'fixed',
                                top: 0, left: 0, right: 0, bottom: 0,
                                backgroundColor: 'rgba(0,0,0,0.6)',
                                backdropFilter: 'blur(8px)',
                                zIndex: 9999,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '20px'
                            }}
                        >
                            <motion.div
                                initial={{ scale: 0.8, y: 50, opacity: 0 }}
                                animate={{ scale: 1, y: 0, opacity: 1 }}
                                exit={{ scale: 0.8, y: 50, opacity: 0 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                style={{
                                    background: '#ffffff', // Forced white background as requested
                                    padding: '40px 30px',
                                    borderRadius: '24px',
                                    position: 'relative',
                                    maxWidth: '440px',
                                    width: '100%',
                                    boxShadow: '0 25px 50px -12px rgba(139, 92, 246, 0.25)',
                                    border: '1px solid rgba(139, 92, 246, 0.2)',
                                    borderTop: '6px solid var(--primary)',
                                    textAlign: 'center',
                                    overflow: 'hidden' // for the sliding cards
                                }}
                            >
                                <div style={{ minHeight: '260px', position: 'relative' }}>
                                    <AnimatePresence mode="wait" custom={slideDir}>
                                        <motion.div
                                            key={currentStep}
                                            custom={slideDir}
                                            initial={{ opacity: 0, x: slideDir > 0 ? 50 : -50 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: slideDir > 0 ? -50 : 50 }}
                                            transition={{ type: 'tween', duration: 0.3 }}
                                            style={{ position: 'relative', width: '100%' }}
                                        >
                                            <div style={{ fontSize: '4.5rem', marginBottom: '16px', display: 'inline-block' }}>
                                                {onboardingSteps[currentStep].emoji}
                                            </div>

                                            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: '0 0 16px 0', color: '#1e293b' }}>
                                                {onboardingSteps[currentStep].title}
                                            </h2>
                                            <p style={{ margin: '0 auto 32px auto', color: '#64748b', fontSize: '1.05rem', lineHeight: 1.6, maxWidth: '90%' }}>
                                                {onboardingSteps[currentStep].desc}
                                            </p>
                                        </motion.div>
                                    </AnimatePresence>
                                </div>

                                {/* Step Indicators */}
                                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
                                    {onboardingSteps.map((_, idx) => (
                                        <div
                                            key={idx}
                                            style={{
                                                width: currentStep === idx ? '24px' : '8px',
                                                height: '8px',
                                                borderRadius: '4px',
                                                background: currentStep === idx ? 'var(--primary)' : '#cbd5e1',
                                                transition: 'all 0.3s ease'
                                            }}
                                        />
                                    ))}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px' }}>
                                    <button
                                        onClick={handlePrev}
                                        disabled={currentStep === 0}
                                        style={{
                                            background: '#f1f5f9',
                                            color: '#64748b', border: 'none', padding: '14px',
                                            borderRadius: '12px', fontSize: '1.2rem',
                                            cursor: currentStep === 0 ? 'default' : 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            opacity: currentStep === 0 ? 0 : 1, transition: 'all 0.2s', pointerEvents: currentStep === 0 ? 'none' : 'auto'
                                        }}
                                    >
                                        <FiChevronLeft />
                                    </button>

                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleNext}
                                        style={{
                                            background: 'var(--primary)', flex: 1,
                                            color: '#ffffff', border: 'none', padding: '14px 24px',
                                            borderRadius: '12px', fontSize: '1.05rem', fontWeight: 700,
                                            cursor: 'pointer', display: 'flex', alignItems: 'center',
                                            justifyContent: 'center', gap: '8px', boxShadow: '0 10px 20px -5px rgba(139, 92, 246, 0.4)',
                                            transition: 'box-shadow 0.2s'
                                        }}
                                    >
                                        {onboardingSteps[currentStep].buttonText} {currentStep < onboardingSteps.length - 1 && <FiChevronRight />}
                                    </motion.button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="feed-filters">
                    {filters.map((filter) => {
                        const Icon = filter.icon;
                        return (
                            <button
                                key={filter.id}
                                className={`feed-filter-btn ${activeFilter === filter.id ? 'active' : ''}`}
                                onClick={() => setActiveFilter(filter.id)}
                                id={`filter-${filter.id}`}
                            >
                                <Icon />
                                {filter.label}
                            </button>
                        );
                    })}
                </div>

                <div className="feed-posts">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>
                            Loading posts...
                        </div>
                    ) : filteredAndSortedPosts.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-tertiary)', background: 'white', borderRadius: '16px', border: '1px dashed #e2e8f0' }}>
                            <p style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '8px' }}>No posts found</p>
                            <p style={{ fontSize: '0.9rem' }}>Be the first one to share something in this category!</p>
                        </div>
                    ) : (
                        filteredAndSortedPosts.map((post, i) => (
                            <PostCard key={post.id} post={post} index={i} />
                        ))
                    )}
                </div>
            </div>

            <RightSidebar />


            <AnimatePresence>
                {showCreateModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="profile-modal-overlay" style={{ zIndex: 2000 }}>
                        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="profile-modal" style={{ maxWidth: '600px', padding: '24px', maxHeight: '85vh', overflowY: 'auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Create a {(currentUser?.isAnonymous || newPost.tag === 'confession') ? 'Confession' : 'Post'}</h2>
                                <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}><FiX /></button>
                            </div>

                            {postError && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '6px', marginBottom: '15px' }}>{postError}</div>}

                            {currentUser?.isAnonymous && (
                                <div style={{ background: '#fef3c7', color: '#b45309', padding: '12px', borderRadius: '6px', marginBottom: '15px', fontSize: '0.9rem' }}>
                                    <strong>Anonymous Mode Active:</strong> You are browsing as a guest. You can only create an anonymous "Confession" post. Your identity is completely hidden.
                                </div>
                            )}

                            <div className="profile-modal-field">
                                <label>Title</label>
                                <input type="text" placeholder="Gimme an interesting title!" value={newPost.title} onChange={e => setNewPost(p => ({ ...p, title: e.target.value }))} />
                            </div>

                            <div className="profile-modal-field">
                                <label>Tag / Category</label>
                                <select
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-light)' }}
                                    value={newPost.tag}
                                    onChange={(e) => setNewPost(p => ({ ...p, tag: e.target.value }))}
                                    disabled={currentUser?.isAnonymous}
                                >
                                    {(currentUser?.isAnonymous ? ['confession'] : ['discussion', 'freelancing', 'confession', 'truth', 'spill', 'shit', 'real', 'help', 'opinion']).map(t => (
                                        <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                                    ))}
                                </select>
                            </div>

                            {newPost.tag === 'freelancing' && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ background: '#eff6ff', padding: '16px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #bfdbfe' }}>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                        <div className="profile-modal-field" style={{ marginBottom: 0 }}>
                                            <label style={{ color: '#1e40af' }}>Total Budget (₹)</label>
                                            <input
                                                type="number"
                                                placeholder="e.g. 500"
                                                value={newPost.budget}
                                                onChange={e => setNewPost(p => ({ ...p, budget: e.target.value }))}
                                                style={{ borderColor: '#bfdbfe' }}
                                            />
                                        </div>
                                        <div className="profile-modal-field" style={{ marginBottom: 0 }}>
                                            <label style={{ color: '#1e40af' }}>Contact Info</label>
                                            <input
                                                type="text"
                                                placeholder="Phone or Username"
                                                value={newPost.contact}
                                                onChange={e => setNewPost(p => ({ ...p, contact: e.target.value }))}
                                                style={{ borderColor: '#bfdbfe' }}
                                            />
                                        </div>
                                    </div>
                                    <p style={{ margin: '8px 0 0 0', fontSize: '0.75rem', color: '#60a5fa' }}>Tell others how much you'll pay and how to reach you.</p>
                                </motion.div>
                            )}

                            <div className="profile-modal-field">
                                <label>Content</label>
                                <textarea
                                    placeholder="What's on your mind?"
                                    style={{
                                        minHeight: '120px',
                                        fontWeight: newPost.textStyle === 'bold' ? 700 : 400,
                                        fontStyle: newPost.textStyle === 'italic' ? 'italic' : 'normal'
                                    }}
                                    value={newPost.content}
                                    onChange={e => setNewPost(p => ({ ...p, content: e.target.value }))}
                                />
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px' }}>
                                    <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600, marginRight: '4px' }}>Style:</span>
                                    {['normal', 'bold', 'italic'].map(style => (
                                        <button
                                            key={style}
                                            type="button"
                                            onClick={() => setNewPost(p => ({ ...p, textStyle: style }))}
                                            style={{
                                                padding: '6px 14px',
                                                borderRadius: '20px',
                                                border: newPost.textStyle === style ? '2px solid #4f46e5' : '1px solid #cbd5e1',
                                                background: newPost.textStyle === style ? '#eef2ff' : 'transparent',
                                                color: newPost.textStyle === style ? '#4f46e5' : '#475569',
                                                fontWeight: style === 'bold' ? 700 : 500,
                                                fontStyle: style === 'italic' ? 'italic' : 'normal',
                                                fontSize: '0.82rem',
                                                cursor: 'pointer',
                                                transition: 'all 0.15s ease'
                                            }}
                                        >
                                            {style.charAt(0).toUpperCase() + style.slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="profile-modal-field">
                                <label>Image (Optional, Max 5MB)</label>
                                <input type="file" accept="image/*" onChange={(e) => {
                                    if (e.target.files[0] && e.target.files[0].size > 5 * 1024 * 1024) {
                                        setPostError('File too large (Max 5MB)');
                                    } else {
                                        setPostFile(e.target.files[0]);
                                        setPostError('');
                                    }
                                }} />
                            </div>

                            <div className="profile-modal-actions" style={{ marginTop: '20px' }}>
                                <button className="profile-modal-cancel" onClick={() => setShowCreateModal(false)}>Cancel</button>
                                <button className="profile-modal-save" onClick={handleCreatePost} disabled={posting}>
                                    {posting ? 'Posting...' : 'Share Post'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
