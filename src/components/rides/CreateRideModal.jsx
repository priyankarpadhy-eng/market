import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { createRide } from '../../firebase/services';
import { FiX, FiMapPin, FiClock, FiCalendar, FiUsers, FiLock } from 'react-icons/fi';
import { motion } from 'framer-motion';
import './CreateRideModal.css';

export default function CreateRideModal({ onClose }) {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [seats, setSeats] = useState(3);
    const [genderPreference, setGenderPreference] = useState('All');

    // Missing profile info stats
    const [phone, setPhone] = useState(currentUser?.phoneNumber || '');
    const [userGender, setUserGender] = useState(currentUser?.gender || '');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!from || !to || !date || !time) return;

        setLoading(true);
        try {
            const combinedDateTime = `${date}T${time}`;
            const depDate = new Date(combinedDateTime);

            if (isNaN(depDate.getTime())) {
                throw new Error('Please enter a valid date and time.');
            }

            // Sync missing profile info if provided
            if (!currentUser?.phoneNumber || !currentUser?.gender) {
                const updates = {};
                if (!currentUser?.phoneNumber && phone) updates.phoneNumber = phone;
                if (!currentUser?.gender && userGender) updates.gender = userGender;

                if (Object.keys(updates).length > 0) {
                    const { updateUserProfile } = await import('../../firebase/services');
                    await updateUserProfile(currentUser.uid, updates);
                }
            }

            await createRide({
                from,
                to,
                departureDateStr: date,
                departureTimeStr: time,
                departureTime: depDate.toISOString(),
                seatsTotal: parseInt(seats) + 1, // Use seatsTotal to match screenshot
                genderPreference: genderPreference.toLowerCase(), // Normalize to lowercase
                organizerId: currentUser.uid,
                organizerName: currentUser.displayName || 'Anonymous Student',
                organizerAvatar: currentUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.uid}`,
                organizerRole: currentUser.role || 'student',
                organizerGender: (userGender || currentUser.gender || 'Unknown').toLowerCase(),
                organizerPhone: phone // Include phone number
            });
            onClose();
        } catch (err) {
            alert(err.message);
        }
        setLoading(false);
    };

    return (
        <div className="ride-modal-overlay">
            <motion.div
                className="ride-modal"
                onClick={e => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
            >
                <div className="modal-header">
                    <h2>Plan your <span className="text-gradient">Ride</span></h2>
                    <button className="close-btn" onClick={onClose}><FiX /></button>
                </div>

                <form onSubmit={handleSubmit} className="ride-form">
                    <div className="form-grid">
                        <div className="form-group">
                            <label><FiMapPin /> From</label>
                            <input
                                placeholder="E.g. IGIT Sarang"
                                value={from}
                                onChange={e => setFrom(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label><FiMapPin /> Destination</label>
                            <input
                                placeholder="E.g. Talcher Station"
                                value={to}
                                onChange={e => setTo(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label><FiCalendar /> Date</label>
                            <input
                                type="date"
                                value={date}
                                min={new Date().toISOString().split('T')[0]}
                                onChange={e => setDate(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label><FiClock /> Time</label>
                            <input
                                type="time"
                                value={time}
                                onChange={e => setTime(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label><FiUsers /> Available Seats (excluding you)</label>
                            <select value={seats} onChange={e => setSeats(e.target.value)}>
                                {[1, 2, 3, 4, 5, 6].map(n => <option key={n} value={n}>{n} Seat{n > 1 ? 's' : ''}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label><FiLock /> Ride Gender Preference</label>
                            <select value={genderPreference} onChange={e => setGenderPreference(e.target.value)}>
                                <option value="All">All Students (Mixed)</option>
                                <option value="Male Only">Male Only</option>
                                <option value="Female Only">Female Only</option>
                            </select>
                        </div>

                        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                            <label>Confirm Your Phone No. (Visible to participants)</label>
                            <input
                                type="tel"
                                placeholder="+91..."
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                required
                            />
                        </div>

                        {!currentUser?.gender && (
                            <div className="missing-profile-info" style={{ gridColumn: '1 / -1', padding: '16px', background: '#fff7ed', borderRadius: '12px', border: '1px solid #ffedd5', marginTop: '10px' }}>
                                <p style={{ fontSize: '0.8rem', color: '#9a3412', fontWeight: 700, margin: '0 0 12px 0' }}>⚠️ One more thing:</p>
                                <div className="form-group">
                                    <label>Your Gender</label>
                                    <select value={userGender} onChange={e => setUserGender(e.target.value)} required>
                                        <option value="">Select</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="form-footer">
                        <p className="privacy-note">
                            Note: Your phone number ({currentUser?.phoneNumber || phone || "Not set"}) will be shared with students who join your ride.
                        </p>
                        <div className="btn-group">
                            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
                            <button type="submit" className="btn-submit" disabled={loading}>
                                {loading ? 'Creating...' : 'Create Ride Post'}
                            </button>
                        </div>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
