import { useState, useRef, useEffect } from 'react';
import { FiSearch, FiEdit, FiVideo, FiPhone, FiMoreVertical, FiPlusCircle, FiSmile, FiSend, FiX } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import {
    subscribeToConversations,
    subscribeToMessages,
    sendMessage as fbSendMessage,
    createConversation,
    getUserByEmail
} from '../firebase/services';
import './Messages.css';

export default function Messages() {
    const { currentUser } = useAuth();
    const [conversations, setConversations] = useState([]);
    const [activeConvId, setActiveConvId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('All');
    const [loading, setLoading] = useState(true);

    // Modal state for new conversation
    const [showNewModal, setShowNewModal] = useState(false);
    const [targetEmail, setTargetEmail] = useState('');
    const [starting, setStarting] = useState(false);
    const [newError, setNewError] = useState('');

    const chatBodyRef = useRef(null);

    // 1. Subscribe to conversations
    useEffect(() => {
        if (!currentUser) return;
        const unsubscribe = subscribeToConversations(currentUser.uid, (data) => {
            setConversations(data);
            if (data.length > 0 && !activeConvId) {
                setActiveConvId(data[0].id);
            }
            setLoading(false);
        });
        return () => unsubscribe();
    }, [currentUser]);

    // 2. Subscribe to messages of active conversation
    useEffect(() => {
        if (!activeConvId) return;
        const unsubscribe = subscribeToMessages(activeConvId, (data) => {
            setMessages(data);
        });
        return () => unsubscribe();
    }, [activeConvId]);

    // Auto-scroll
    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
    }, [messages]);

    const activeConv = conversations.find(c => c.id === activeConvId);

    const handleSendMessage = async () => {
        if (!messageInput.trim() || !activeConvId) return;

        const newMessage = {
            sender: currentUser?.displayName || 'User',
            senderId: currentUser?.uid,
            content: messageInput.trim(),
            time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
            isOwn: true,
        };

        try {
            await fbSendMessage(activeConvId, newMessage);
            setMessageInput('');
        } catch (err) {
            console.error('Send error:', err);
        }
    };

    const handleStartConversation = async () => {
        if (!targetEmail.trim()) return;
        setStarting(true);
        setNewError('');
        try {
            // Find user by email
            const targetUser = await getUserByEmail(targetEmail);
            if (!targetUser) throw new Error('User not found.');
            if (targetUser.uid === currentUser.uid) throw new Error("You can't message yourself.");

            // Check if exists
            const existing = conversations.find(c => c.participantIds.includes(targetUser.uid));
            if (existing) {
                setActiveConvId(existing.id);
                setShowNewModal(false);
            } else {
                const newConvId = await createConversation({
                    name: targetUser.displayName,
                    participantIds: [currentUser.uid, targetUser.uid],
                    participants: [
                        { uid: currentUser.uid, name: currentUser.displayName },
                        { uid: targetUser.uid, name: targetUser.displayName }
                    ],
                    type: 'private',
                    lastMessage: 'Conversation started',
                    lastTime: 'Now'
                });
                setActiveConvId(newConvId);
                setShowNewModal(false);
            }
        } catch (err) {
            setNewError(err.message);
        }
        setStarting(false);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const filteredConversations = conversations.filter(c => {
        const matchesSearch = c.name?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab = activeTab === 'All' || (activeTab === 'Groups' && c.type === 'group');
        return matchesSearch && matchesTab;
    });

    const getInitials = (name) => (name || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    return (
        <div className={`messages-page ${activeConvId ? 'chat-open' : ''}`}>
            <div className="messages-list">
                <div className="messages-list-header">
                    <h2>Messages</h2>
                    <button className="messages-new-btn" onClick={() => setShowNewModal(true)}><FiEdit size={14} /> New Message</button>
                </div>
                <div className="messages-search">
                    <FiSearch className="messages-search-icon" />
                    <input type="text" placeholder="Search conversations..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                </div>
                <div className="messages-tabs">
                    {['All', 'Groups'].map(tab => (
                        <button key={tab} className={`messages-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>{tab}</button>
                    ))}
                </div>
                <div className="messages-conversations">
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>
                    ) : filteredConversations.map(conv => (
                        <div key={conv.id} className={`conversation-item ${activeConvId === conv.id ? 'active' : ''}`} onClick={() => setActiveConvId(conv.id)}>
                            <div className="conversation-avatar" style={{ background: conv.avatarColor || '#6366f1' }}>
                                {getInitials(conv.name)}
                                {conv.online && <span className="conversation-avatar-online" />}
                            </div>
                            <div className="conversation-info">
                                <div className="conversation-info-top">
                                    <span className="conversation-name">{conv.name}</span>
                                    <span className="conversation-time">{conv.lastTime}</span>
                                </div>
                                <p className="conversation-preview">{conv.lastMessage}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="messages-chat">
                {activeConv ? (
                    <>
                        <div className="messages-chat-header">
                            <div className="messages-chat-header-info">
                                <div className="messages-chat-header-avatar" style={{ background: activeConv.avatarColor || '#6366f1' }}>{getInitials(activeConv.name)}</div>
                                <div>
                                    <div className="messages-chat-header-name">{activeConv.name}</div>
                                    <div className="messages-chat-header-status">
                                        {activeConv.type === 'group' ? `${activeConv.onlineCount || 0} online` : (activeConv.online ? 'Online' : 'Offline')}
                                    </div>
                                </div>
                            </div>
                            <div className="messages-chat-header-actions">
                                <button><FiVideo /></button>
                                <button><FiPhone /></button>
                                <button><FiMoreVertical /></button>
                            </div>
                        </div>

                        <div className="messages-chat-body" ref={chatBodyRef}>
                            {messages.map((msg, i) => {
                                const isOwn = msg.senderId === currentUser?.uid;
                                return (
                                    <div key={msg.id || i} className={`chat-message-row ${isOwn ? 'own' : ''}`}>
                                        {!isOwn && <div className="chat-message-avatar" />}
                                        <div>
                                            <div className={`chat-bubble ${isOwn ? 'outgoing' : 'incoming'}`}>
                                                {msg.content}
                                            </div>
                                            <div className="chat-message-meta">
                                                <span className="chat-message-time">{msg.time}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="messages-chat-input">
                            <button className="messages-chat-input-attach"><FiPlusCircle /></button>
                            <input type="text" placeholder="Type a message..." value={messageInput} onChange={(e) => setMessageInput(e.target.value)} onKeyDown={handleKeyDown} />
                            <span className="messages-chat-input-emoji"><FiSmile /></span>
                            <button className="messages-chat-input-send" onClick={handleSendMessage} disabled={!messageInput.trim()}><FiSend /></button>
                        </div>
                    </>
                ) : (
                    <div className="messages-chat-empty">
                        <div className="messages-chat-empty-icon">💬</div>
                        <p>Select a conversation to start messaging</p>
                    </div>
                )}
            </div>

            {/* New Message Modal */}
            {showNewModal && (
                <div className="profile-modal-overlay" onClick={() => setShowNewModal(false)} style={{ zIndex: 2000 }}>
                    <div className="profile-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '400px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>New Message</h2>
                            <button onClick={() => setShowNewModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><FiX /></button>
                        </div>
                        {newError && <div style={{ padding: '10px', background: '#fee2e2', color: '#dc2626', borderRadius: '6px', marginBottom: '15px' }}>{newError}</div>}
                        <div className="profile-modal-field">
                            <label>User Email</label>
                            <input
                                type="email"
                                placeholder="Enter student email..."
                                value={targetEmail}
                                onChange={e => setTargetEmail(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="profile-modal-actions">
                            <button className="profile-modal-cancel" onClick={() => setShowNewModal(false)}>Cancel</button>
                            <button className="profile-modal-save" onClick={handleStartConversation} disabled={starting}>
                                {starting ? 'Searching...' : 'Start Chat'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
