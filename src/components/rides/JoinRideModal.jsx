import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { joinRide } from '../../firebase/services';
import { FiX, FiCheckCircle, FiLock, FiPhone } from 'react-icons/fi';
import { motion } from 'framer-motion';

export default function JoinRideModal({ ride, onClose }) {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(false);
    const [phone, setPhone] = useState(currentUser?.phoneNumber || '');
    const [gender, setGender] = useState(currentUser?.gender || '');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Sync profile info if missing
            if (!currentUser?.phoneNumber || !currentUser?.gender) {
                const updates = {};
                if (!currentUser?.phoneNumber && phone) updates.phoneNumber = phone;
                if (!currentUser?.gender && gender) updates.gender = gender;

                if (Object.keys(updates).length > 0) {
                    const { updateUserProfile } = await import('../../firebase/services');
                    await updateUserProfile(currentUser.uid, updates);
                }
            }

            await joinRide(ride.id, {
                uid: currentUser.uid,
                name: currentUser.displayName || 'Anonymous Student',
                avatar: currentUser.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.uid}`,
                gender: gender || currentUser.gender || 'Unknown',
                phone: phone // Pass the confirmed phone number
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
                style={{ width: '400px' }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
            >
                <div className="modal-header">
                    <h2>Confirm <span className="text-gradient">Join</span></h2>
                    <button className="close-btn" onClick={onClose}><FiX /></button>
                </div>

                <form onSubmit={handleSubmit} className="ride-form">
                    <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '20px' }}>
                        You're joining <strong>{ride.organizerName}'s</strong> ride to <strong>{ride.to}</strong>.
                    </p>

                    <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', marginBottom: '24px' }}>
                        <p style={{ fontSize: '0.8rem', fontWeight: 800, color: '#1e293b', marginBottom: '16px' }}>CONFIRM CONTACT INFO</p>

                        <div className="form-group" style={{ marginBottom: '16px' }}>
                            <label><FiPhone /> Your Phone Number</label>
                            <input
                                type="tel"
                                placeholder="+91..."
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                required
                                style={{ width: '100%', boxSizing: 'border-box' }}
                            />
                        </div>

                        {!currentUser?.gender && (
                            <div className="form-group">
                                <label><FiLock /> Your Gender</label>
                                <select
                                    value={gender}
                                    onChange={e => setGender(e.target.value)}
                                    required
                                    style={{ width: '100%' }}
                                >
                                    <option value="">Select</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="btn-group">
                        <button type="button" className="btn-cancel" onClick={onClose}>Back</button>
                        <button type="submit" className="btn-submit" disabled={loading}>
                            {loading ? 'Processing...' : 'Confirm Join'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
