import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { createPost } from '../../firebase/services';
import { uploadFile } from '../../lib/storage';
import { motion, AnimatePresence } from 'framer-motion';
import ReactCrop, { centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { FiSend, FiTag, FiUser, FiHelpCircle, FiImage, FiVideo, FiX, FiCheck, FiMaximize } from 'react-icons/fi';
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
    { id: 'poetic', label: 'Poetic', color: '#047857' },
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

    // Cropping States
    const [showCropper, setShowCropper] = useState(false);
    const [crop, setCrop] = useState();
    const [completedCrop, setCompletedCrop] = useState(null);
    const [imgRef, setImgRef] = useState(null);

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

        const maxSize = 50 * 1024 * 1024;
        if (file.size > maxSize) {
            setError(`File too large. Maximum size is 50MB limit.`);
            return;
        }

        const reader = new FileReader();
        reader.addEventListener('load', () => {
            setMediaPreview(reader.result);
            if (file.type.startsWith('image/')) {
                setShowCropper(true);
            }
        });
        reader.readAsDataURL(file);
        setMediaFile(file);
        setError('');
    };

    const onImageLoad = (e) => {
        const { width, height } = e.currentTarget;
        const crop = centerCrop(
            makeAspectCrop({ unit: '%', width: 90 }, 3 / 2, width, height),
            width,
            height
        );
        setCrop(crop);
        setImgRef(e.currentTarget);
    };

    const getCroppedImg = async () => {
        if (!completedCrop || !imgRef) return;

        const canvas = document.createElement('canvas');
        const scaleX = imgRef.naturalWidth / imgRef.width;
        const scaleY = imgRef.naturalHeight / imgRef.height;
        canvas.width = completedCrop.width;
        canvas.height = completedCrop.height;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(
            imgRef,
            completedCrop.x * scaleX,
            completedCrop.y * scaleY,
            completedCrop.width * scaleX,
            completedCrop.height * scaleY,
            0,
            0,
            completedCrop.width,
            completedCrop.height
        );

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                if (!blob) return;
                const file = new File([blob], 'cropped.jpg', { type: 'image/jpeg' });
                resolve({ file, url: URL.createObjectURL(blob) });
            }, 'image/jpeg');
        });
    };

    const handleSaveCrop = async () => {
        const { file, url } = await getCroppedImg();
        setMediaFile(file);
        setMediaPreview(url);
        setShowCropper(false);
    };

    const clearMedia = () => {
        setMediaFile(null);
        setMediaPreview(null);
        setUploadProgress(0);
        setShowCropper(false);
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

                <AnimatePresence>
                    {showCropper && mediaPreview && !mediaFile?.type?.startsWith('video/') && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="cropper-modal-overlay"
                            style={{ position: 'fixed', inset: 0, zIndex: 3000, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
                        >
                            <div className="cropper-card" style={{ background: '#fff', borderRadius: '24px', width: '100%', maxWidth: '550px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
                                <div style={{ padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Resize & Position</h3>
                                    <button type="button" onClick={() => setShowCropper(false)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><FiX /></button>
                                </div>
                                <div style={{ padding: '20px', maxHeight: '60vh', overflowY: 'auto', display: 'flex', justifyContent: 'center', background: '#0f172a' }}>
                                    <ReactCrop
                                        crop={crop}
                                        onChange={(c) => setCrop(c)}
                                        onComplete={(c) => setCompletedCrop(c)}
                                        aspect={selectedTag === 'poetic' ? 3 / 2 : undefined}
                                        circularCrop={false}
                                    >
                                        <img src={mediaPreview} onLoad={onImageLoad} style={{ maxWidth: '100%', display: 'block' }} alt="Crop target" />
                                    </ReactCrop>
                                </div>
                                <div style={{ padding: '20px', background: '#fff', borderTop: '1px solid #eee', display: 'flex', gap: '12px' }}>
                                    <button type="button" onClick={() => setShowCropper(false)} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#fff', fontWeight: 600, color: '#64748b', cursor: 'pointer' }}>Cancel</button>
                                    <button type="button" onClick={handleSaveCrop} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', background: 'var(--primary)', color: '#fff', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                                        <FiCheck /> Done
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {mediaPreview && !showCropper && (
                    <div className="media-preview-container" style={{
                        position: 'relative',
                        marginTop: '12px',
                        borderRadius: '16px',
                        overflow: 'hidden',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0'
                    }}>
                        <button type="button" onClick={clearMedia} style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10, background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backdropFilter: 'blur(4px)' }}>
                            <FiX />
                        </button>

                        {mediaFile?.type?.startsWith('video/') ? (
                            <video src={mediaPreview} controls style={{ width: '100%', maxHeight: '400px', objectFit: 'contain', background: '#000' }} />
                        ) : (
                            <div className="preview-image-wrap" style={{ position: 'relative' }}>
                                <img src={mediaPreview} alt="Preview" style={{ width: '100%', maxHeight: '450px', objectFit: 'contain', display: 'block' }} />
                                <button
                                    type="button"
                                    onClick={() => setShowCropper(true)}
                                    style={{ position: 'absolute', bottom: '12px', right: '12px', background: 'rgba(255,255,255,0.95)', border: 'none', padding: '10px 18px', borderRadius: '30px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 20px rgba(0,0,0,0.1)', color: 'var(--primary)' }}
                                >
                                    <FiMaximize /> Resize
                                </button>
                            </div>
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
