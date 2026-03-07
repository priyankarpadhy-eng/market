import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiArrowUp, FiArrowDown, FiMessageSquare, FiShare2, FiBookmark, FiDownload, FiFile, FiClock, FiShield, FiTrash2, FiMoreHorizontal, FiHeart, FiFlag, FiX, FiBriefcase, FiDollarSign, FiPhoneCall, FiFeather, FiMap } from 'react-icons/fi';
import { votePost, deletePost, reportPost } from '../../firebase/services';
import { useAuth } from '../../contexts/AuthContext';
import './PostCard.css';

export default function PostCard({ post, index = 0 }) {
    const [votes, setVotes] = useState(post.votes || 0);
    const [userVote, setUserVote] = useState(0);
    const [saved, setSaved] = useState(false);
    const navigate = useNavigate();
    const { isAdmin, currentUser } = useAuth();
    const [showReportModal, setShowReportModal] = useState(false);
    const [reportReason, setReportReason] = useState('');
    const [reported, setReported] = useState(false);
    const [reportLoading, setReportLoading] = useState(false);
    const [reportError, setReportError] = useState('');

    const handleVote = async (direction) => {
        if (currentUser?.isAnonymous) {
            alert("Guest users can only post Confessions. Create an account to vote!");
            return;
        }
        let delta;
        if (userVote === direction) {
            delta = -direction;
            setVotes(votes - direction);
            setUserVote(0);
        } else {
            delta = direction - userVote;
            setVotes(votes - userVote + direction);
            setUserVote(direction);
        }
        try { await votePost(post.id, delta); } catch { }
    };

    const formatVotes = (num) => {
        if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
        return num;
    };

    const handleShare = (e) => {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
        alert('Post link copied to clipboard!');
    };

    const handleReport = async () => {
        if (currentUser?.isAnonymous) {
            alert("Guest users cannot report posts. Please create an account.");
            return;
        }
        if (!reportReason) return;
        setReportLoading(true);
        setReportError('');
        try {
            await reportPost(post.id, {
                reason: reportReason,
                reportedBy: currentUser?.uid || 'anonymous',
                reporterName: currentUser?.displayName || 'Anonymous',
                postTitle: post.title || post.content?.slice(0, 50),
                postAuthor: post.authorName || post.author || 'Unknown',
            });
            setReported(true);
            setShowReportModal(false);
            setReportReason('');
        } catch (err) {
            console.error('Report failed:', err);
            setReportError('Failed to submit report. Please try again.');
        }
        setReportLoading(false);
    };

    const now = Date.now();
    const pTime = post.createdAt?.seconds ? post.createdAt.seconds * 1000 : now;

    const timeDiffMs = now - pTime;
    const hoursOld = Math.floor(timeDiffMs / (1000 * 60 * 60));
    const timeAgoStr = hoursOld < 1 ? 'Just now' : hoursOld < 24 ? `${hoursOld} hours ago` : `${Math.floor(hoursOld / 24)} days ago`;

    const dateStr = post.createdAt?.seconds
        ? new Date(post.createdAt.seconds * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
        : 'Today';

    const daysOld = Math.floor((now - pTime) / (1000 * 60 * 60 * 24));
    const daysLeft = Math.max(0, 7 - daysOld);
    const isConfession = post.tag && post.tag.toLowerCase() === 'confession';
    const isPoem = post.tag && post.tag.toLowerCase() === 'poetic';
    const isFreelancing = post.tag && post.tag.toLowerCase() === 'freelancing';
    const isDiscussion = post.tag && post.tag.toLowerCase() === 'discussion';
    const isImmortal = votes >= 50;

    const getColorfulStyle = (tagName) => {
        const colors = [
            { bg: '#fee2e2', color: '#b91c1c' },
            { bg: '#dcfce7', color: '#15803d' },
            { bg: '#ede9fe', color: '#6d28d9' },
            { bg: '#e0f2fe', color: '#0369a1' },
            { bg: '#fef3c7', color: '#b45309' },
        ];
        const hash = tagName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[hash % colors.length];
    };

    // ═══════════════════════════════════════════
    // POEM CARD - Forest Hill Theme
    // ═══════════════════════════════════════════
    if (isPoem) {
        const hasMedia = post.image || post.video;
        return (
            <article className="poem-forest-card" style={{ animationDelay: `${index * 0.08}s` }}>
                <div className="poem-bg-leaves">
                    <span>🍃</span><span>🌿</span><span>🍃</span><span>🍂</span><span>🌱</span>
                </div>

                <div className="poem-layout">
                    {/* Left Side - Mountain/Forest Accent */}
                    <div className="poem-left">
                        <div className="poem-mountain-icon">
                            <FiMap />
                        </div>
                        <h2 className="poem-title">{post.title || 'Soul of\nThe Woods'}</h2>
                        <div className="poem-divider"></div>

                        {hasMedia && (
                            <div className="poem-media-frame">
                                {post.video ? (
                                    <video src={post.video} controls className="confession-media" />
                                ) : (
                                    <img src={post.image} alt="poem" className="confession-media" loading="lazy" />
                                )}
                            </div>
                        )}

                        <div className="confession-left-actions" style={{ marginTop: 'auto', color: 'white' }}>
                            <button className="confession-action-btn" style={{ color: 'white' }} onClick={() => handleVote(1)}>
                                <FiArrowUp /> {formatVotes(votes)}
                            </button>
                            <button className="confession-action-btn" style={{ color: 'white' }} onClick={handleShare}>
                                <FiShare2 />
                            </button>
                        </div>
                    </div>

                    {/* Right Side - Paper Content */}
                    <div className="poem-right">
                        <div className="poem-header">
                            <span className="poem-tag-label">LITERARY POEM</span>
                            <span className="poem-date">Dated: {dateStr}</span>
                        </div>

                        <div className="poem-body">
                            <FiFeather className="poem-quote" style={{ opacity: 0.2, top: 0, left: 0 }} />
                            <p className="poem-content">{post.content}</p>
                        </div>

                        <div className="poem-footer">
                            <div className="poem-author-box">
                                <span className="poem-author-label">WRITTEN WITH SOUL</span>
                                <div className="poem-author-name">~ {post.authorName || 'Anonymous Bard'}</div>
                            </div>
                            <button className="poem-action-btn" onClick={() => navigate(`/post/${post.id}`)}>
                                <FiMessageSquare /> {post.comments || 0}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="poem-expiry">
                    <FiClock /> Forest whispers stay for 7 days... {daysLeft} left.
                </div>
            </article>
        );
    }

    // ═══════════════════════════════════════════
    // CONFESSION CARD - Special heartfelt design
    // ═══════════════════════════════════════════
    if (isConfession) {
        const hasMedia = post.image || post.video;
        return (
            <article className="confession-letter-card" style={{ animationDelay: `${index * 0.08}s` }}>
                {/* Decorative hearts background */}
                <div className="confession-bg-hearts">
                    <span>♥</span><span>♥</span><span>♥</span><span>♥</span><span>♥</span>
                    <span>♥</span><span>♥</span><span>♥</span><span>♥</span><span>♥</span>
                </div>

                <div className="confession-letter-layout">
                    {/* Left Side - Title + Media */}
                    <div className="confession-left">
                        <div className="confession-heart-badge">
                            <FiHeart fill="#e11d48" stroke="#e11d48" size={20} />
                        </div>
                        <h2 className="confession-title-text">
                            {post.title || 'With All\nMy Heart'}
                        </h2>
                        {hasMedia && (
                            <div className="confession-media-frame">
                                {post.video ? (
                                    <video src={post.video} controls className="confession-media" />
                                ) : (
                                    <img src={post.image} alt="confession" className="confession-media" loading="lazy" />
                                )}
                            </div>
                        )}
                        <div className="confession-left-actions">
                            <button className={`confession-action-btn ${userVote === 1 ? 'active' : ''}`} onClick={() => handleVote(1)}>
                                <FiHeart fill={userVote === 1 ? '#e11d48' : 'none'} /> {formatVotes(votes)}
                            </button>
                            <button className="confession-action-btn" onClick={handleShare}>
                                <FiShare2 />
                            </button>
                        </div>
                    </div>

                    {/* Right Side - Letter Content */}
                    <div className="confession-right">
                        <div className="confession-letter-header">
                            <span className="confession-to">TO MY DEAREST,</span>
                            <span className="confession-date">Posted on {dateStr}</span>
                        </div>

                        <div className="confession-letter-body">
                            <span className="confession-quote-mark open">"</span>
                            <p className="confession-content" style={{
                                fontWeight: (post.textStyle === 'bold' || post.isBold) ? 700 : 400,
                            }}>
                                {post.content}
                            </p>
                            <span className="confession-quote-mark close">"</span>
                        </div>

                        <div className="confession-letter-footer">
                            <div className="confession-signed">
                                <span className="confession-signed-label">SIGNED WITH LOVE</span>
                                <div className="confession-author">
                                    <div className="confession-author-avatar">
                                        <FiHeart fill="#e11d48" stroke="none" size={18} />
                                    </div>
                                    <span>{post.authorName || 'Your Secret Admirer'}</span>
                                </div>
                            </div>
                            <div className="confession-right-actions">
                                <button className="confession-view-btn" onClick={() => navigate(`/post/${post.id}`)}>
                                    <FiMessageSquare />
                                    <div style={{ textAlign: 'left' }}>
                                        <span>VIEW</span>
                                        <div>Confession</div>
                                    </div>
                                </button>
                                {isAdmin && (
                                    <button className="confession-action-btn small delete" style={{ position: 'absolute', top: '10px', right: '10px' }} onClick={async (e) => {
                                        e.stopPropagation();
                                        if (window.confirm('Admin: Delete this confession?')) {
                                            await deletePost(post.id);
                                        }
                                    }}>
                                        <FiTrash2 />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="confession-expiry">
                    {isImmortal ? (
                        <><FiShield /> Immortalized (50+ Likes) - Kept Forever</>
                    ) : (
                        <><FiClock /> Auto-deletes in {daysLeft} day{daysLeft !== 1 ? 's' : ''}. Get 50 likes to keep forever</>
                    )}
                </div>
            </article>
        );
    }

    // ═══════════════════════════════════════════
    // NORMAL POST CARD
    // ═══════════════════════════════════════════
    return (
        <article className={`post-card ${isFreelancing ? 'freelance-card' : ''} ${isDiscussion ? 'discussion-card' : ''} ${showReportModal ? 'modal-active' : ''}`} style={{ animationDelay: `${index * 0.08}s` }}>
            {isFreelancing && (
                <div className="freelance-bg-money">
                    <span>💸</span><span>💰</span><span>💵</span><span>💸</span><span>💰</span>
                    <span>💵</span><span>💸</span><span>💰</span><span>💵</span><span>💸</span>
                </div>
            )}
            {isDiscussion && (
                <div className="discussion-bg-emojis">
                    <span>💡</span><span>🗣️</span><span>💭</span><span>🤔</span><span>✨</span>
                    <span>💬</span><span>🔥</span><span>🙌</span><span>🎉</span><span>🌟</span>
                </div>
            )}
            <div className="post-header">
                <img
                    src={post.authorAvatar || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marketplace'}
                    alt={post.authorName}
                    className="post-author-avatar"
                    onError={(e) => { e.target.onerror = null; e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.authorName || 'Marketplace'}`; }}
                />
                <div className="post-header-text">
                    <div className="post-author-line">
                        <span className="post-author-name">{post.authorName || `u/${post.author}`}</span>
                        <span className="post-role-badge">Student</span>
                        <span style={{ color: '#94a3b8', fontSize: '0.9rem', margin: '0 4px' }}>•</span>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{timeAgoStr}</span>
                        <span style={{ color: '#cbd5e1', fontSize: '0.75rem', margin: '0 2px' }}>·</span>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{dateStr}</span>
                    </div>
                </div>
                <button className="post-options-btn" aria-label="More options" onClick={() => setShowReportModal(true)}>
                    <FiMoreHorizontal />
                </button>
            </div>

            {showReportModal && (
                <div className="report-card-premium">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <h5><FiFlag color="#ef4444" /> Report Post</h5>
                        <button onClick={() => setShowReportModal(false)} style={{ background: '#f1f5f9', border: 'none', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}><FiX /></button>
                    </div>
                    <p className="subtitle">Is there something wrong with this post?</p>

                    {reported ? (
                        <div style={{ textAlign: 'center', padding: '20px 0' }}>
                            <div style={{ width: '50px', height: '50px', background: '#dcfce7', color: '#10b981', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto', fontSize: '1.5rem' }}>✓</div>
                            <p style={{ color: '#10b981', fontSize: '0.95rem', fontWeight: 700 }}>Report Submitted</p>
                            <p style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '4px' }}>Our admins will review this shortly.</p>
                        </div>
                    ) : (
                        <>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                {['Spam', 'Harassment', 'Inappropriate Content', 'Misinformation', 'Other'].map(reason => (
                                    <label
                                        key={reason}
                                        className={`report-option-label ${reportReason === reason ? 'selected' : ''}`}
                                        onClick={() => setReportReason(reason)}
                                    >
                                        <input
                                            type="radio"
                                            name="report"
                                            value={reason}
                                            checked={reportReason === reason}
                                            onChange={() => { }} // Controlled by Label click
                                            style={{ display: 'none' }}
                                        />
                                        {reason}
                                    </label>
                                ))}
                            </div>
                            <button
                                className="report-submit-btn"
                                onClick={handleReport}
                                disabled={!reportReason || reportLoading}
                            >
                                {reportLoading ? 'Submitting…' : reportReason ? 'Submit Report' : 'Select a reason'}
                            </button>
                            {reportError && (
                                <p style={{ color: '#ef4444', fontSize: '0.8rem', textAlign: 'center', marginTop: '8px' }}>
                                    {reportError}
                                </p>
                            )}
                        </>
                    )}
                </div>
            )}

            <div className="post-tags-container">
                {post.tag && (
                    <span
                        className="post-tag-pill colorful"
                        style={getColorfulStyle(post.tag)}
                    >
                        #{post.tag.charAt(0).toUpperCase() + post.tag.slice(1)}
                    </span>
                )}
                {post.tags && post.tags.map(tag => (
                    <span
                        key={tag}
                        className="post-tag-pill colorful"
                        style={getColorfulStyle(tag)}
                    >
                        #{tag}
                    </span>
                ))}
            </div>

            {
                post.tag === 'freelancing' && (
                    <div style={{ padding: '0 16px', marginBottom: '16px', position: 'relative', zIndex: 1 }}>
                        <div style={{
                            background: 'linear-gradient(135deg, #fff5f5 0%, #fff0f0 100%)',
                            border: '1px solid #fecaca',
                            borderRadius: '16px',
                            padding: '18px',
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '20px',
                            boxShadow: '0 4px 12px rgba(220, 38, 38, 0.06)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}>
                            <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '60px', height: '60px', background: 'rgba(220, 38, 38, 0.05)', borderRadius: '50%' }}></div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', zIndex: 1 }}>
                                <div style={{ background: '#dc2626', color: 'white', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px rgba(220, 38, 38, 0.2)' }}>
                                    <FiBriefcase size={18} />
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontSize: '0.65rem', color: '#991b1b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Gig Type</p>
                                    <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#7f1d1d' }}>Freelance Work</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', zIndex: 1 }}>
                                <div style={{ background: '#10b981', color: 'white', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px rgba(16, 185, 129, 0.2)' }}>
                                    <FiDollarSign size={18} />
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontSize: '0.65rem', color: '#065f46', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Budget</p>
                                    <p style={{ margin: 0, fontSize: '1rem', fontWeight: 800, color: '#064e3b' }}>₹{post.budget || 'Open'}</p>
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', zIndex: 1 }}>
                                <div style={{ background: '#f59e0b', color: 'white', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px rgba(245, 158, 11, 0.2)' }}>
                                    <FiPhoneCall size={18} />
                                </div>
                                <div>
                                    <p style={{ margin: 0, fontSize: '0.65rem', color: '#92400e', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Contact</p>
                                    <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: '#78350f' }}>{post.contact || 'In Comments'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            <div className="post-content-container">
                <p className="post-content-text" style={{
                    fontWeight: (post.textStyle === 'bold' || post.isBold) ? 700 : 400,
                    fontStyle: post.textStyle === 'italic' ? 'italic' : 'normal'
                }}>{post.content}</p>
            </div>

            {
                post.video && (
                    <div className="post-media-container">
                        <video src={post.video} controls className="post-media-image" style={{ width: '100%', maxHeight: '500px', objectFit: 'cover', display: 'block' }} />
                    </div>
                )
            }

            {
                post.image && (
                    <div className="post-media-container">
                        <img src={post.image} alt="post media" className="post-media-image" loading="lazy" />
                    </div>
                )
            }

            {
                post.attachment && (
                    <div className="post-attachment-container" style={{ padding: '0 16px' }}>
                        <div className="post-attachment" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: '#f8fafc', borderRadius: '8px', cursor: 'pointer' }}>
                            <div style={{ width: '40px', height: '40px', background: '#e0e7ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#4f46e5' }}><FiFile /></div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>{post.attachment.name}</div>
                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{post.attachment.size} • {post.attachment.type}</div>
                            </div>
                            <FiDownload style={{ color: '#4f46e5' }} />
                        </div>
                    </div>
                )
            }

            <div style={{ fontSize: '0.75rem', marginTop: '12px', padding: '0 16px', display: 'flex', alignItems: 'center', gap: '6px', color: isImmortal ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
                {isImmortal ? (
                    <><FiShield /> Immortalized (50+ Likes) - Kept Forever</>
                ) : (
                    <><FiClock /> Auto-deletes in {daysLeft} day{daysLeft !== 1 ? 's' : ''}. Get 50 likes to keep forever</>
                )}
            </div>

            <div className="post-footer">
                <div className="post-footer-left">
                    <div className="post-vote-group">
                        <button className={`vote-btn ${userVote === 1 ? 'active' : ''}`} onClick={() => handleVote(1)}><FiArrowUp /></button>
                        <span className="vote-count">{formatVotes(votes)}</span>
                        <button className={`vote-btn ${userVote === -1 ? 'active' : ''}`} onClick={() => handleVote(-1)}><FiArrowDown /></button>
                    </div>
                    <button className="post-footer-btn" onClick={() => navigate(`/post/${post.id}`)}>
                        <FiMessageSquare />
                        <span className="btn-text-count">{post.comments}</span>
                    </button>
                </div>
                <div className="post-footer-right">
                    <button className="post-footer-btn" onClick={handleShare}>
                        <FiShare2 />
                        <span className="btn-text">Share</span>
                    </button>
                    <button className={`post-footer-btn icon-only ${saved ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setSaved(!saved); }}>
                        <FiBookmark />
                    </button>
                    {isAdmin && (
                        <button className="post-footer-btn delete" onClick={async (e) => {
                            e.preventDefault(); e.stopPropagation();
                            if (window.confirm('Admin: Delete this post?')) {
                                await deletePost(post.id);
                            }
                        }}>
                            <FiTrash2 />
                        </button>
                    )}
                </div>
            </div>
        </article >
    );
}
