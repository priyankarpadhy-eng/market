import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { createPost } from '../../firebase/services';
import { uploadFile } from '../../lib/storage';
import { motion } from 'framer-motion';
import { FiSend, FiTag, FiUser, FiHelpCircle, FiImage, FiVideo, FiX } from 'react-icons/fi';
import './CreatePost.css';

const TAGS = [
    { id: 'discussion', label: 'Discussion', color: '#64748b' },
    { id: 'freelancing', label: 'Freelancing', color: '#3b82f6' },
    { id: 'confession', label: 'Confession', color: '#8b5cf6' },
    { id: 'truth', label: 'Truth', color: '#6d28d9' },
    { id: 'spill', label: 'Spill', color: '#ec4899' },
    { id: 'real', label: 'Real', color: '#10b981' },
    { id: 'help', label: 'Help', color: '#f59e0b' },
    { id: 'opinion', label: 'Opinion', color: '#06b6d4' },
];

export default function CreatePost({ onPostSuccess, isModal = false }) {
    const { currentUser } = useAuth();
    const [content, setContent] = useState('');
    const [selectedTag, setSelectedTag] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [budget, setBudget] = useState('');
    const [contact, setContact] = useState('');

    // Media upload states
    const [mediaFile, setMediaFile] = useState(null);
    const [mediaPreview, setMediaPreview] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    // If not logged in, only confession is allowed
    const availableTags = currentUser ? TAGS : TAGS.filter(t => t.id === 'confession');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return setError('Content is required');
        if (!selectedTag) return setError('Please select a tag');

        setLoading(true);
        setError('');
        try {
            let mediaUrl = null;
            let mediaType = null;

            if (mediaFile) {
                mediaUrl = await uploadFile(mediaFile, 'posts', setUploadProgress);
                mediaType = mediaFile.type.startsWith('video/') ? 'video' : 'image';
            }

            const postData = {
                title: selectedTag ? `${selectedTag.charAt(0).toUpperCase() + selectedTag.slice(1)} Update` : 'New Post',
                content,
                tag: selectedTag,
                type: mediaType || 'text',
                image: mediaType === 'image' ? mediaUrl : null,
                video: mediaType === 'video' ? mediaUrl : null,
                authorId: currentUser?.uid || 'guest',
                authorName: currentUser?.displayName || 'Anonymous',
                authorAvatar: currentUser?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marketplace',
                budget: selectedTag === 'freelancing' ? budget : null,
                contact: selectedTag === 'freelancing' ? contact : null,
                communityId: 'all', // Global feed
                communityName: 'Global',
            };

            await createPost(postData);
            setContent('');
            setSelectedTag(null);
            setMediaFile(null);
            setMediaPreview(null);
            setUploadProgress(0);
            setBudget('');
            setContact('');
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                if (onPostSuccess) onPostSuccess();
            }, 1000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleMediaChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validation limits: strictly 50MB for any file
        const isVideo = file.type.startsWith('video/');
        const maxSize = 50 * 1024 * 1024;

        if (file.size > maxSize) {
            setError(`File too large. Maximum size is 50MB limit.`);
            return;
        }

        setMediaFile(file);
        setMediaPreview(URL.createObjectURL(file));
        setError('');
    };

    const clearMedia = () => {
        setMediaFile(null);
        setMediaPreview(null);
        setUploadProgress(0);
    };

    return (
        <div className={`create-post-card ${isModal ? 'modal-mode' : ''}`}>
            <div className="create-post-header">
                <img
                    src={currentUser?.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marketplace'}
                    alt="User"
                    className="create-post-avatar"
                    onError={(e) => { e.target.onerror = null; e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser?.displayName || 'User'}`; }}
                />
                <div className="create-post-title">
                    <h4>{currentUser ? `What's on your mind, ${currentUser.displayName.split(' ')[0]}?` : 'Share a confession anonymously'}</h4>
                    {!currentUser && <p className="guest-badge">Guest mode (Confessions only)</p>}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="create-post-form">
                <textarea
                    placeholder={currentUser ? "Share your thoughts, experiences, or questions..." : "Write your confession here... (No login required)"}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows="3"
                />

                {mediaPreview && (
                    <div className="media-preview-container" style={{ position: 'relative', marginTop: '12px', borderRadius: '12px', overflow: 'hidden' }}>
                        <button type="button" onClick={clearMedia} style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 10, background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '30px', height: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            <FiX />
                        </button>
                        {mediaFile?.type?.startsWith('video/') ? (
                            <video src={mediaPreview} controls style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', background: '#000' }} />
                        ) : (
                            <img src={mediaPreview} alt="Preview" style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }} />
                        )}
                        {uploadProgress > 0 && uploadProgress < 100 && (
                            <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '4px', background: 'rgba(255,255,255,0.3)' }}>
                                <div style={{ height: '100%', background: 'var(--primary)', width: `${uploadProgress}%`, transition: 'width 0.2s' }} />
                            </div>
                        )}
                    </div>
                )}

                <div className="tag-selector-wrapper">
                    <p className="section-label"><FiTag /> Select Compulsory Tag:</p>
                    <div className="tag-grid">
                        {availableTags.map((tag) => (
                            <button
                                type="button"
                                key={tag.id}
                                className={`tag-chip ${selectedTag === tag.id ? 'active' : ''}`}
                                onClick={() => setSelectedTag(tag.id)}
                                style={{
                                    '--tag-color': tag.color,
                                    borderColor: selectedTag === tag.id ? tag.color : 'transparent',
                                    backgroundColor: selectedTag === tag.id ? `${tag.color}15` : 'var(--bg-hover)'
                                }}
                            >
                                {tag.label}
                            </button>
                        ))}
                    </div>
                </div>

                {selectedTag === 'freelancing' && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} style={{ background: '#eff6ff', padding: '16px', borderRadius: '12px', marginBottom: '20px', border: '1px solid #bfdbfe' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                            <div className="profile-modal-field" style={{ marginBottom: 0 }}>
                                <label style={{ color: '#1e40af', display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>Total Budget (₹)</label>
                                <input
                                    type="number"
                                    placeholder="e.g. 500"
                                    value={budget}
                                    onChange={e => setBudget(e.target.value)}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #bfdbfe' }}
                                />
                            </div>
                            <div className="profile-modal-field" style={{ marginBottom: 0 }}>
                                <label style={{ color: '#1e40af', display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '6px' }}>Contact Info</label>
                                <input
                                    type="text"
                                    placeholder="Phone or Username"
                                    value={contact}
                                    onChange={e => setContact(e.target.value)}
                                    style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #bfdbfe' }}
                                />
                            </div>
                        </div>
                        <p style={{ margin: '8px 0 0 0', fontSize: '0.75rem', color: '#60a5fa' }}>Tell others how much you'll pay and how to reach you.</p>
                    </motion.div>
                )}

                {error && <p className="error-msg">{error}</p>}
                {success && <p className="success-msg">Post published successfully!</p>}

                <div className="create-post-footer">
                    <div className="anonymous-notice" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="media-actions" style={{ display: 'flex', gap: '8px' }}>
                            <label className="media-upload-btn" style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#64748b', fontSize: '0.9rem', padding: '6px 12px', background: '#f1f5f9', borderRadius: '8px', transition: 'all 0.2s' }}>
                                <FiImage /> <span style={{ display: 'none' }} className="hidden-mobile">Photo</span>
                                <input type="file" accept="image/*" onChange={handleMediaChange} style={{ display: 'none' }} />
                            </label>
                            <label className="media-upload-btn" style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', color: '#64748b', fontSize: '0.9rem', padding: '6px 12px', background: '#f1f5f9', borderRadius: '8px', transition: 'all 0.2s' }}>
                                <FiVideo /> <span style={{ display: 'none' }} className="hidden-mobile">Video</span>
                                <input type="file" accept="video/*" onChange={handleMediaChange} style={{ display: 'none' }} />
                            </label>
                        </div>
                        {!currentUser ? (
                            <span style={{ fontSize: '0.85rem' }}><FiUser /> <strong>Anonymous</strong></span>
                        ) : selectedTag === 'confession' ? (
                            <span className="confession-info" style={{ fontSize: '0.85rem' }}><FiHelpCircle /> Confessions are public</span>
                        ) : null}
                    </div>
                    <button
                        type="submit"
                        className="post-submit-btn"
                        disabled={loading || !content.trim() || !selectedTag}
                    >
                        {loading ? 'Posting...' : <><FiSend /> Post</>}
                    </button>
                </div>
            </form>
        </div>
    );
}
