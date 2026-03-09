import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { subscribeToRideMessages, sendRideMessage, subscribeToParticipants } from '../../firebase/services';
import { FiSend, FiX, FiInfo, FiUsers, FiPhone, FiStar, FiMessageSquare } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import './RideChat.css';

export default function RideChat({ ride, onClose }) {
    const { currentUser } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [participants, setParticipants] = useState([]);
    const [showParticipants, setShowParticipants] = useState(false);
    const scrollRef = useRef();

    useEffect(() => {
        const unsubMsgs = subscribeToRideMessages(ride.id, (msgs) => {
            setMessages(msgs);
            setTimeout(() => {
                if (scrollRef.current) {
                    scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                }
            }, 100);
        });

        const unsubParts = subscribeToParticipants(ride.id, (list) => {
            setParticipants(list);
        });

        return () => {
            unsubMsgs();
            unsubParts();
        };
    }, [ride.id]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            await sendRideMessage(ride.id, {
                text: newMessage,
                senderId: currentUser.uid,
                senderName: currentUser.displayName,
                senderAvatar: currentUser.photoURL
            });
            setNewMessage('');
        } catch (err) {
            console.error('Send error:', err);
        }
    };

    return (
        <motion.div
            className="ride-chat-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
        >
            <motion.div
                className="ride-chat-container"
                initial={{ y: 20, scale: 0.98 }}
                animate={{ y: 0, scale: 1 }}
                exit={{ y: 20, scale: 0.98 }}
                onClick={e => e.stopPropagation()}
            >
                <div className="chat-header">
                    <div className="ride-info-mini">
                        <div className="chat-title-row">
                            <h3>Ride Chat</h3>
                            <button
                                className={`participants-toggle ${showParticipants ? 'active' : ''}`}
                                onClick={() => setShowParticipants(!showParticipants)}
                                title="See Participants Info"
                            >
                                <FiUsers /> {participants.length}
                            </button>
                        </div>
                        <p>{ride.from} → {ride.to}</p>
                    </div>
                    <button className="close-chat-btn" onClick={onClose}>
                        <FiX />
                    </button>
                </div>

                <AnimatePresence>
                    {showParticipants && (
                        <motion.div
                            className="participants-panel"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                        >
                            <label className="panel-label">CONFIRMED CONTACTS</label>
                            <div className="participants-list">
                                {participants.map(p => (
                                    <div key={p.uid} className="participant-item">
                                        <div className="p-left">
                                            <img src={p.avatar} alt="" />
                                            <div className="p-details">
                                                <span className="p-name">
                                                    {p.name} {p.uid === ride.organizerId && <FiStar className="org-star" title="Organizer" />}
                                                </span>
                                                <a href={`tel:${p.phone}`} className="p-phone">
                                                    <FiPhone /> {p.phone || 'No phone set'}
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="chat-notice">
                    <FiInfo /> Coordinate pickup and share live locations here.
                </div>

                <div className="chat-messages" ref={scrollRef}>
                    {messages.length === 0 && (
                        <div className="empty-chat-state">
                            <FiMessageSquare />
                            <p>No messages yet. Say hello!</p>
                        </div>
                    )}
                    {messages.map((m, i) => {
                        const isMine = m.senderId === currentUser.uid;
                        const msgTime = m.createdAt?.toDate ? m.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...';

                        return (
                            <div key={m.id || i} className={`chat-bubble-wrap ${isMine ? 'mine' : 'theirs'}`}>
                                {!isMine && <img src={m.senderAvatar} alt="" className="sender-avatar" />}
                                <div className="chat-bubble">
                                    {!isMine && <span className="sender-name">{m.senderName}</span>}
                                    <p>{m.text}</p>
                                    <span className="msg-time">{msgTime}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <form className="chat-input-row" onSubmit={handleSend}>
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                    />
                    <button type="submit" disabled={!newMessage.trim()}>
                        <FiSend />
                    </button>
                </form>
            </motion.div>
        </motion.div>
    );
}
