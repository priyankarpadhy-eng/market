import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FiThumbsUp, FiThumbsDown, FiMessageSquare, FiShare2, FiMoreHorizontal, FiChevronRight, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { posts } from '../data/mockData';
import { comments as localComments } from '../data/extraData';
import { getPost, votePost, getComments as fbGetComments, addComment as fbAddComment, addReply as fbAddReply, likeComment as fbLikeComment, getPosts, getCommunity, deletePost, deleteComment, deleteReply } from '../firebase/services';
import './PostDetail.css';

const mockTrendingThreads = [];

export default function PostDetail() {
    const { postId } = useParams();
    const { currentUser, isAdmin } = useAuth();
    const [post, setPost] = useState({});
    const navigate = useNavigate();
    const [comments, setComments] = useState([]);
    const [trendingPosts, setTrendingPosts] = useState([]);
    const [community, setCommunity] = useState(null);
    const [newComment, setNewComment] = useState('');
    const [liked, setLiked] = useState(false);
    const [userVote, setUserVote] = useState(0);
    const [likeCount, setLikeCount] = useState(0);
    const [communityJoined, setCommunityJoined] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [commentLikes, setCommentLikes] = useState({});

    // Fetch post and comments from Firestore
    useEffect(() => {
        async function load() {
            try {
                const fbPost = await getPost(postId);
                if (fbPost) {
                    setPost(fbPost);
                    setLikeCount(fbPost.votes || 0);

                    // Fetch community info
                    const comm = await getCommunity(fbPost.communityId);
                    if (comm) setCommunity(comm);
                }

                const fbComments = await fbGetComments(postId);
                if (fbComments.length > 0) {
                    setComments(fbComments);
                }

                // Fetch trending posts for sidebar
                const trending = await getPosts('top');
                setTrendingPosts(trending.slice(0, 4));
            } catch (err) {
                console.log('PostDetail load error:', err.message);
            }
        }
        load();
    }, [postId]);

    const handleVote = async (direction) => {
        if (currentUser?.isAnonymous) {
            alert("Guest users can only post Confessions. Create an account to vote!");
            return;
        }
        let delta;
        if (userVote === direction) {
            delta = -direction;
            setLikeCount(prev => prev - direction);
            setUserVote(0);
            setLiked(false);
        } else {
            delta = direction - userVote;
            setLikeCount(prev => prev - userVote + direction);
            setUserVote(direction);
            setLiked(direction === 1);
        }
        try { await votePost(postId, delta); } catch { }
    };

    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
    };

    const toggleCommentLike = async (commentId) => {
        const wasLiked = commentLikes[commentId];
        setCommentLikes(prev => ({ ...prev, [commentId]: !wasLiked }));
        if (!wasLiked) {
            try { await fbLikeComment(postId, commentId); } catch { }
        }
    };

    const handleAdminDeletePost = async () => {
        if (!window.confirm("Admin: Permanently delete this post?")) return;
        await deletePost(postId);
        navigate('/');
    };

    const handleAdminDeleteComment = async (commentId) => {
        if (!window.confirm("Admin: Delete this comment?")) return;
        await deleteComment(postId, commentId);
        setComments(prev => prev.filter(c => c.id !== commentId));
    };

    const handleAdminDeleteReply = async (commentId, replyId) => {
        if (!window.confirm("Admin: Delete this reply?")) return;
        await deleteReply(postId, commentId, replyId);
        setComments(prev => prev.map(c => c.id === commentId ? { ...c, replies: c.replies.filter(r => r.id !== replyId) } : c));
    };

    const handlePostComment = async () => {
        if (!newComment.trim()) return;
        const commentData = {
            author: currentUser?.displayName || 'Anonymous Student',
            authorId: currentUser?.uid || 'guest',
            content: newComment.trim(),
            timeAgo: 'just now',
        };

        const tempComment = {
            id: `comment-new-${Date.now()}`,
            ...commentData,
            likes: 0,
            replies: [],
        };
        setComments(prev => [tempComment, ...prev]);
        setNewComment('');

        try {
            await fbAddComment(postId, commentData);
        } catch (err) {
            console.log('Comment save fallback:', err.message);
        }
    };

    const handlePostReply = async (commentId) => {
        if (!replyText.trim()) return;
        const replyData = {
            author: currentUser?.displayName || 'Anonymous Student',
            authorId: currentUser?.uid || 'guest',
            content: replyText.trim(),
            timeAgo: 'just now',
        };

        const tempReply = { id: `reply-new-${Date.now()}`, ...replyData, likes: 0 };
        setComments(prev =>
            prev.map(c => c.id === commentId ? { ...c, replies: [...c.replies, tempReply] } : c)
        );
        setReplyText('');
        setReplyingTo(null);

        try {
            await fbAddReply(postId, commentId, replyData);
        } catch (err) {
            console.log('Reply save fallback:', err.message);
        }
    };

    const getInitials = (name) => (name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    const totalComments = comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0);

    return (
        <div className="post-detail-page">
            <div className="post-detail-main">
                <div className="post-detail-breadcrumb">
                    <Link to="/">Home</Link>
                    <FiChevronRight size={12} />
                    <span>Discussion Threads</span>
                    <FiChevronRight size={12} />
                    <span>{post.title?.slice(0, 30)}...</span>
                </div>

                <div className="post-detail-card">
                    <div className="post-detail-author">
                        <div className="post-detail-author-avatar">{getInitials(post.author)}</div>
                        <div>
                            <div className="post-detail-author-name">{post.author}</div>
                            <div className="post-detail-author-meta">
                                Posted {post.timeAgo} • <Link to={`/community/${post.communityId}`}>{post.communityName}</Link>
                            </div>
                        </div>
                    </div>

                    <h1 className="post-detail-title">{post.title}</h1>

                    <div className="post-detail-body">
                        <p>{post.content}</p>
                        {post.image && (
                            <img src={post.image} alt={post.title} style={{ width: '100%', borderRadius: 'var(--radius-md)', marginTop: '12px' }} />
                        )}
                    </div>

                    <div className="post-detail-actions">
                        <button className={`post-detail-action ${userVote === 1 ? 'liked' : ''}`} onClick={() => handleVote(1)} style={{ color: userVote === 1 ? 'var(--primary)' : 'inherit' }}>
                            <FiThumbsUp /> {likeCount}
                        </button>
                        <button className={`post-detail-action ${userVote === -1 ? 'disliked' : ''}`} onClick={() => handleVote(-1)} style={{ color: userVote === -1 ? '#ef4444' : 'inherit' }}>
                            <FiThumbsDown />
                        </button>
                        <span className="post-detail-action"><FiMessageSquare /> {totalComments} Comments</span>
                        <button className="post-detail-action" onClick={handleShare}><FiShare2 /> Share</button>
                        {isAdmin && (
                            <button className="post-detail-action" onClick={handleAdminDeletePost} style={{ color: '#ef4444' }}>
                                <FiTrash2 /> Delete
                            </button>
                        )}
                    </div>
                </div>

                <div className="post-detail-comment-box">
                    {currentUser?.isAnonymous ? (
                        <div style={{
                            width: '100%',
                            background: 'linear-gradient(135deg, #eff6ff, #eef2ff)',
                            border: '1px solid #bfdbfe',
                            borderRadius: '12px',
                            padding: '20px',
                            textAlign: 'center'
                        }}>
                            <div style={{ fontSize: '1.5rem', marginBottom: '8px' }}>🔒</div>
                            <div style={{ fontWeight: 700, color: '#1e40af', marginBottom: '6px' }}>Guests can't comment</div>
                            <p style={{ fontSize: '0.85rem', color: '#475569', marginBottom: '14px' }}>Create a free account to join the discussion, vote, and more.</p>
                            <Link to="/auth" state={{ mode: 'signup' }} style={{
                                display: 'inline-block',
                                background: '#2563eb',
                                color: 'white',
                                padding: '8px 20px',
                                borderRadius: '8px',
                                fontWeight: 600,
                                fontSize: '0.875rem',
                                textDecoration: 'none'
                            }}>Create Free Account</Link>
                        </div>
                    ) : (
                        <>
                            <div className="post-detail-comment-avatar">{getInitials(currentUser?.displayName)}</div>
                            <div className="post-detail-comment-input-wrapper">
                                <textarea className="post-detail-comment-input" placeholder="Add a comment..." value={newComment} onChange={(e) => setNewComment(e.target.value)} id="comment-input" />
                                <div className="post-detail-comment-submit">
                                    <button onClick={handlePostComment} disabled={!newComment.trim()} id="post-comment-btn">Post Comment</button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                <div className="post-detail-discussion-header">
                    <h2>Discussion</h2>
                    <span className="post-detail-discussion-count">({totalComments})</span>
                </div>

                {comments.map((comment) => (
                    <div key={comment.id} className="comment-card">
                        <div className="comment-avatar">{getInitials(comment.author)}</div>
                        <div className="comment-body">
                            <div className="comment-header">
                                <div>
                                    <span className="comment-author">{comment.author}</span>
                                    <span className="comment-time">{comment.timeAgo}</span>
                                </div>
                                <button className="comment-more"><FiMoreHorizontal /></button>
                            </div>
                            <p className="comment-content">{comment.content}</p>
                            <div className="comment-actions">
                                <button className="comment-action" onClick={() => setReplyingTo(comment.id)}>Reply</button>
                                <button className={`comment-action ${commentLikes[comment.id] ? 'liked' : ''}`} onClick={() => toggleCommentLike(comment.id)}>
                                    <FiThumbsUp /> {(comment.likes || 0) + (commentLikes[comment.id] ? 1 : 0)}
                                </button>
                                {isAdmin && (
                                    <button className="comment-action" onClick={() => handleAdminDeleteComment(comment.id)} style={{ color: '#ef4444' }}>
                                        <FiTrash2 />
                                    </button>
                                )}
                            </div>

                            {comment.replies?.length > 0 && (
                                <div className="comment-replies">
                                    {comment.replies.map((reply) => (
                                        <div key={reply.id} className="reply-card">
                                            <div className="reply-avatar">{getInitials(reply.author)}</div>
                                            <div style={{ flex: 1 }}>
                                                <div><span className="reply-author">{reply.author}</span><span className="reply-time">{reply.timeAgo}</span></div>
                                                <p className="reply-content">{reply.content}</p>
                                                <div className="comment-actions">
                                                    <button className="comment-action" onClick={() => setReplyingTo(comment.id)}>Reply</button>
                                                    <button className={`comment-action ${commentLikes[reply.id] ? 'liked' : ''}`} onClick={() => toggleCommentLike(reply.id)}>
                                                        <FiThumbsUp /> {(reply.likes || 0) + (commentLikes[reply.id] ? 1 : 0)}
                                                    </button>
                                                    {isAdmin && (
                                                        <button className="comment-action" onClick={() => handleAdminDeleteReply(comment.id, reply.id)} style={{ color: '#ef4444' }}>
                                                            <FiTrash2 />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {replyingTo === comment.id && (
                                <div className="reply-input-wrapper">
                                    <input type="text" placeholder="Write a reply..." value={replyText} onChange={(e) => setReplyText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handlePostReply(comment.id)} autoFocus />
                                    <button onClick={() => handlePostReply(comment.id)}>Reply</button>
                                </div>
                            )}

                            {replyingTo !== comment.id && (
                                <button className="comment-action" style={{ marginTop: '6px' }} onClick={() => setReplyingTo(comment.id)}>Reply</button>
                            )}
                        </div>
                    </div>
                ))}

                <div className="post-detail-view-more"><a href="#">View more comments</a></div>
            </div>

            <div className="post-detail-sidebar">
                <div className="post-detail-about">
                    <h3>About {community?.name || 'this community'}</h3>
                    <p>{community?.description || 'A place for students to share resources, ask questions, and connect with peers across all departments.'}</p>
                    <div className="post-detail-about-stats">
                        <div className="post-detail-about-stat">
                            <span className="post-detail-about-stat-label">Members</span>
                            <span className="post-detail-about-stat-value">{(community?.members || 0).toLocaleString()}</span>
                        </div>
                        <div className="post-detail-about-stat">
                            <span className="post-detail-about-stat-label">Online</span>
                            <span className="post-detail-about-stat-value online">{community?.online || 0}</span>
                        </div>
                    </div>
                    <button className={`post-detail-joined-btn ${communityJoined ? 'joined' : ''}`} onClick={() => setCommunityJoined(!communityJoined)} id="sidebar-join-btn">
                        {communityJoined ? 'Joined' : 'Join Community'}
                    </button>
                </div>

                <div className="post-detail-trending">
                    <h3>Trending Threads</h3>
                    {trendingPosts.length > 0 ? trendingPosts.filter(p => p.id !== postId).map((thread) => (
                        <Link to={`/post/${thread.id}`} key={thread.id} className="post-detail-trending-item" style={{ textDecoration: 'none', display: 'block' }}>
                            <div className="post-detail-trending-item-title">{thread.title}</div>
                            <div className="post-detail-trending-item-meta">{thread.votes || 0} votes • {thread.communityName}</div>
                        </Link>
                    )) : mockTrendingThreads.map((thread, i) => (
                        <div key={i} className="post-detail-trending-item">
                            <div className="post-detail-trending-item-title">{thread.title}</div>
                            <div className="post-detail-trending-item-meta">{thread.meta}</div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
