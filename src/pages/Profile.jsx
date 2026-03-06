import { useState, useEffect } from 'react';
import { FiEdit2, FiCamera, FiCalendar, FiMapPin, FiShield, FiStar, FiZap } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { getUserProfile, updateUserProfile, isNicknameAvailable } from '../firebase/services';
import { uploadFile } from '../lib/storage';
import './Profile.css';


export default function Profile() {
    const { currentUser, updateUserProfile: updateAuthProfile, isAdmin } = useAuth();
    const [profile, setProfile] = useState({
        displayName: '',
        major: '',
        bio: '',
        location: '',
        classYear: '',
        avatar: '/images/avatar.png',
        postsCount: 0,
        commentsCount: 0
    });

    const [showEditModal, setShowEditModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [editForm, setEditForm] = useState({
        displayName: '',
        major: '',
        bio: '',
        location: '',
    });
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [profileError, setProfileError] = useState('');
    const [nicknameStatus, setNicknameStatus] = useState({ checking: false, available: true, message: '' });

    useEffect(() => {
        if (!showEditModal || !editForm.displayName || !currentUser) return;

        if (editForm.displayName.length < 3) {
            setNicknameStatus({ checking: false, available: true, message: '' });
            return;
        }

        const timer = setTimeout(async () => {
            setNicknameStatus(prev => ({ ...prev, checking: true }));
            try {
                const isAvailable = await isNicknameAvailable(editForm.displayName, currentUser.uid);
                setNicknameStatus({
                    checking: false,
                    available: isAvailable,
                    message: isAvailable ? '✓ Available' : '✗ Already taken'
                });
            } catch (err) {
                setNicknameStatus({ checking: false, available: true, message: '' });
            }
        }, 600);

        return () => clearTimeout(timer);
    }, [editForm.displayName, showEditModal, currentUser?.uid]);

    // Load profile from Firestore
    useEffect(() => {
        async function loadProfile() {
            if (!currentUser) return;
            try {
                const uid = currentUser.uid;
                const firestoreProfile = await getUserProfile(uid);
                if (firestoreProfile) {
                    setProfile(firestoreProfile);
                    setEditForm({
                        displayName: firestoreProfile.displayName || '',
                        major: firestoreProfile.major || '',
                        bio: firestoreProfile.bio || '',
                        location: firestoreProfile.location || '',
                    });
                }

            } catch (err) {
                console.log('Profile load error:', err.message);
            }
            setLoading(false);
        }
        loadProfile();
    }, [currentUser]);

    const handleSaveProfile = async () => {
        const updatedProfile = {
            displayName: editForm.displayName,
            major: editForm.major,
            bio: editForm.bio,
            location: editForm.location,
        };
        setProfile(prev => ({ ...prev, ...updatedProfile }));
        setShowEditModal(false);

        try {
            const uid = currentUser.uid;
            await updateUserProfile(uid, updatedProfile);
            if (updateAuthProfile) await updateAuthProfile(updatedProfile);
        } catch (err) {
            console.log('Profile save error:', err.message);
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploadingAvatar(true);
        try {
            const tempUrl = URL.createObjectURL(file);
            setProfile(prev => ({ ...prev, avatar: tempUrl })); // Optimistic update

            const url = await uploadFile(file, 'avatars');
            setProfile(prev => ({ ...prev, avatar: url, photoURL: url }));

            const uid = currentUser?.uid || 'demo-user-1';
            await updateUserProfile(uid, { photoURL: url, avatar: url });
            if (updateAuthProfile) await updateAuthProfile({ photoURL: url });
            setProfileError('');
        } catch (err) {
            setProfileError(err.message || 'Failed to upload image');
            // Revert on failure
            if (currentUser?.photoURL) {
                setProfile(prev => ({ ...prev, avatar: currentUser.photoURL }));
            }
        }
        setUploadingAvatar(false);
    };



    return (
        <div className="profile-page">
            {profileError && (
                <div style={{ padding: '12px 16px', background: '#fee2e2', color: '#dc2626', borderRadius: 'var(--radius-md)', marginBottom: '20px', fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {profileError}
                    <button onClick={() => setProfileError('')} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: 600 }}>✕</button>
                </div>
            )}
            <div className="profile-card animate-fadeIn">
                <div className="profile-avatar-wrapper">
                    <img src={profile.avatar || profile.photoURL || '/images/avatar.png'} alt={profile.displayName} className="profile-avatar" style={{ opacity: uploadingAvatar ? 0.5 : 1 }} />
                    <label className="profile-avatar-edit" title="Change photo" style={{ cursor: 'pointer' }}>
                        <FiCamera />
                        <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarUpload} disabled={uploadingAvatar} />
                    </label>
                </div>
                <div className="profile-info">
                    <div className="profile-info-top">
                        <h1 className="profile-name">{profile.displayName}</h1>
                        <button className="profile-edit-btn" onClick={() => setShowEditModal(true)} id="edit-profile-btn">
                            <FiEdit2 size={14} /> Edit Profile
                        </button>
                    </div>
                    {profile.major && <div className="profile-major"><span>&lt;/&gt;</span> {profile.major}</div>}
                    <div className="profile-meta">
                        <div className="profile-meta-item"><FiCalendar /> {profile.classYear || 'Joining...'}</div>
                        {profile.location && <div className="profile-meta-item"><FiMapPin /> {profile.location}</div>}
                    </div>
                    <p className="profile-bio">{profile.bio || 'This student hasn\'t added a bio yet.'}</p>
                </div>
            </div>

            <div className="profile-academic-card">
                <div className="profile-academic-label">Academic Hub</div>
                <p className="profile-academic-text">Connected to {profile.university || 'IGIT Sarang'} Network.</p>
            </div>

            {/* Admin CTA Card — only for non-admins */}
            {currentUser && !currentUser.isAnonymous && !isAdmin && (
                <div className="admin-cta-card">
                    <div className="admin-cta-shimmer" />
                    <div className="admin-cta-badge"><FiShield size={12} /> Admin Access</div>
                    <div className="admin-cta-icon">
                        <FiZap size={28} />
                    </div>
                    <h3 className="admin-cta-title">Want to Become a Campus Admin?</h3>
                    <p className="admin-cta-body">
                        Are you a <strong>class representative, club president, event coordinator</strong>, or any
                        other post holder on campus? As an admin, you'll be able to
                        <strong> publish official campus events</strong> — including fests, workshops,
                        seminars, hackathons, and more — directly to the community feed.
                    </p>
                    <ul className="admin-cta-perks">
                        <li><FiStar size={12} /> Post & manage official campus events</li>
                        <li><FiStar size={12} /> Add banners, registration links & details</li>
                        <li><FiStar size={12} /> Moderate community content</li>
                        <li><FiStar size={12} /> Verified admin badge on your profile</li>
                    </ul>
                    <p className="admin-cta-instruction">
                        Fill out this quick form and we'll review your request within 24 hours:
                    </p>
                    <div className="admin-cta-form-wrap">
                        <iframe
                            src="https://docs.google.com/forms/d/e/1FAIpQLSdEDJrgE0DNYxWlr7E0Jc0xw480HjD2zscFHElwk3G-GVpDDw/viewform?embedded=true"
                            width="100%"
                            height="720"
                            frameBorder="0"
                            marginHeight="0"
                            marginWidth="0"
                            title="Admin Access Request Form"
                            loading="lazy"
                        >
                            Loading form…
                        </iframe>
                    </div>
                </div>
            )}


            {showEditModal && (
                <div className="profile-modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
                        <h2>Edit Profile</h2>
                        <div className="profile-modal-field">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label htmlFor="edit-name">Username / Nickname</label>
                                {nicknameStatus.message && (
                                    <span style={{ fontSize: '0.7rem', color: nicknameStatus.available ? '#10b981' : '#ef4444', fontWeight: 700 }}>{nicknameStatus.message}</span>
                                )}
                            </div>
                            <input
                                type="text"
                                id="edit-name"
                                value={editForm.displayName}
                                onChange={(e) => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
                                style={{ borderColor: !nicknameStatus.available ? '#ef4444' : (nicknameStatus.available && editForm.displayName !== profile.displayName ? '#10b981' : 'var(--border-medium)') }}
                            />
                            <p style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '4px' }}>Please avoid using your real name for privacy unless absolutely necessary.</p>
                        </div>
                        <div className="profile-modal-field">
                            <label htmlFor="edit-major">Major</label>
                            <input type="text" id="edit-major" value={editForm.major} onChange={(e) => setEditForm(prev => ({ ...prev, major: e.target.value }))} />
                        </div>
                        <div className="profile-modal-field">
                            <label htmlFor="edit-location">Location</label>
                            <input type="text" id="edit-location" value={editForm.location} onChange={(e) => setEditForm(prev => ({ ...prev, location: e.target.value }))} />
                        </div>
                        <div className="profile-modal-field">
                            <label htmlFor="edit-bio">Bio</label>
                            <textarea id="edit-bio" value={editForm.bio} onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))} />
                        </div>
                        <div className="profile-modal-actions">
                            <button className="profile-modal-cancel" onClick={() => setShowEditModal(false)}>Cancel</button>
                            <button className="profile-modal-save" onClick={handleSaveProfile} id="save-profile-btn" disabled={!nicknameStatus.available || nicknameStatus.checking}>Save Changes</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
