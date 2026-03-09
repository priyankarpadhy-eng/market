import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { subscribeToParticipants, leaveRide, cancelRide } from '../../firebase/services';
import { FiUsers, FiUser, FiClock, FiMapPin, FiArrowRight, FiCheckCircle, FiTrash2, FiMessageSquare, FiShare2 } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import JoinRideModal from './JoinRideModal';
import RideChat from './RideChat';
import './RideCard.css';

export default function RideCard({ ride, index = 0, highlighted = false }) {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [participants, setParticipants] = useState([]);

    useEffect(() => {
        const unsub = subscribeToParticipants(ride.id, (list) => {
            setParticipants(list);
        });
        return () => unsub();
    }, [ride.id]);

    const isParticipant = ride.participantIds?.includes(currentUser?.uid);
    const isOrganizer = ride.organizerId === currentUser?.uid;
    const totalSeats = ride.seatsTotal || ride.totalSeats || 4;
    const seatsTaken = participants.length || ride.seatsTaken || 1;
    const isFull = seatsTaken >= totalSeats;

    const departureDate = ride.departureTime instanceof Date ? ride.departureTime : new Date(ride.departureTime);
    const departureStr = departureDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = departureDate.toLocaleDateString([], { day: 'numeric', month: 'short' });

    const handleShare = async () => {
        const availableSeats = totalSeats - seatsTaken;
        const shareUrl = `https://igitmarketplace.shop/rides?id=${ride.id}`;
        const shareText = `*Marketplace*\n\nFrom: ${ride.from}\nTo: ${ride.to}\n\n${dateStr} and ${departureStr}\n\nAvailable seats: ${availableSeats}\nRide creator: ${ride.organizerName}\nContact number: ${ride.organizerPhone || 'Not available'}\n\nRide link:\n${shareUrl}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: `Ride to ${ride.to}`,
                    text: shareText,
                    url: shareUrl
                });
            } catch (err) {
                console.log('Share error:', err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(shareText);
                alert("📋 Ride details copied to clipboard! You can now paste and send it to your friends.");
            } catch (err) {
                alert("Could not copy text. Please try manual copy.");
            }
        }
    };

    const handleJoin = () => {
        setShowJoinModal(true);
    };

    const handleLeave = async () => {
        if (window.confirm("Leave this ride?")) {
            setLoading(true);
            try { await leaveRide(ride.id, currentUser.uid); } catch (err) { alert(err.message); }
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        if (window.confirm("Cancel this entire ride? Your fellow students will be notified.")) {
            setLoading(true);
            try { await cancelRide(ride.id); } catch (err) { alert(err.message); }
            setLoading(false);
        }
    };

    const getThemeClass = (pref) => {
        const p = (pref || 'mixed').toLowerCase();
        if (p.includes('female')) return 'theme-pink';
        if (p.includes('male')) return 'theme-blue';
        return 'theme-indigo';
    };

    return (
        <motion.article
            id={`ride-${ride.id}`}
            className={`ride-card ${getThemeClass(ride.genderPreference)} ${highlighted ? 'highlighted' : ''}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
        >
            <div className="ride-header">
                <div className="header-left">
                    <div className="status-badge">
                        {(() => {
                            const pref = (ride.genderPreference || 'mixed').toLowerCase();
                            if (pref.includes('female')) return <><FiUser /> Female Only</>;
                            if (pref.includes('male')) return <><FiUser /> Male Only</>;
                            return <><FiUsers /> Mixed Ride</>;
                        })()}
                    </div>
                    <span className="ride-time"><FiClock /> {departureStr} • {dateStr}</span>
                </div>
                <button className="share-ride-btn" onClick={handleShare} title="Share Ride Details">
                    <FiShare2 />
                </button>
            </div>

            <div className="ride-route">
                <div className="route-stop">
                    <FiMapPin className="icon from" />
                    <div className="stop-info">
                        <label>FROM</label>
                        <p>{ride.from}</p>
                    </div>
                </div>
                <div className="route-arrow">
                    <FiArrowRight />
                </div>
                <div className="route-stop">
                    <FiMapPin className="icon to" />
                    <div className="stop-info">
                        <label>DESTINATION</label>
                        <p>{ride.to}</p>
                    </div>
                </div>
            </div>

            <div className="ride-seats-visual">
                <label className="section-label">SEATING CHART</label>
                <div className="seats-grid">
                    {Array.from({ length: totalSeats }).map((_, i) => {
                        const occupant = participants[i];
                        return (
                            <div key={i} className={`seat-icon ${occupant ? 'occupied' : 'empty'}`} title={occupant?.name || 'Available seat'}>
                                {occupant ? (
                                    <img src={occupant.avatar} alt={occupant.name} />
                                ) : (
                                    <FiUsers />
                                )}
                            </div>
                        );
                    })}
                </div>
                <p className="seats-count">{seatsTaken} of {totalSeats} seats taken</p>
            </div>

            <div className="ride-footer">
                <div className="organizer-info">
                    <img src={ride.organizerAvatar} alt={ride.organizerName} />
                    <div>
                        <span className="org-label">Organizer</span>
                        <p className="org-name">{ride.organizerName}</p>
                    </div>
                </div>

                <div className="ride-actions">
                    {isOrganizer ? (
                        <div className="actions-group">
                            <button className="ride-btn chat" onClick={() => setShowChat(true)}>
                                <FiMessageSquare /> Chat
                            </button>
                            <button className="ride-btn cancel" onClick={handleCancel} disabled={loading}>
                                <FiTrash2 /> Cancel
                            </button>
                        </div>
                    ) : isParticipant ? (
                        <div className="actions-group">
                            <button className="ride-btn chat" onClick={() => setShowChat(true)}>
                                <FiMessageSquare /> Chat
                            </button>
                            <button className="ride-btn leave" onClick={handleLeave} disabled={loading}>
                                Leave
                            </button>
                        </div>
                    ) : isFull ? (
                        <button className="ride-btn full" disabled>
                            Ride Full
                        </button>
                    ) : (
                        <button className="ride-btn join" onClick={handleJoin} disabled={loading}>
                            {loading ? 'Joining...' : 'Join Ride'}
                        </button>
                    )}
                </div>
            </div>

            {isParticipant && (
                <div className="participant-badge">
                    <FiCheckCircle /> Joined
                </div>
            )}

            <AnimatePresence>
                {showJoinModal && (
                    <JoinRideModal
                        ride={ride}
                        onClose={() => setShowJoinModal(false)}
                    />
                )}
                {showChat && (
                    <RideChat
                        ride={ride}
                        onClose={() => setShowChat(false)}
                    />
                )}
            </AnimatePresence>
        </motion.article>
    );
}
