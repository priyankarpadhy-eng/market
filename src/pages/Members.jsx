import { useState, useEffect } from 'react';
import { FiUsers, FiMapPin, FiBookOpen } from 'react-icons/fi';
import { getAllUsers } from '../firebase/services';
import './Members.css';

export default function Members() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadUsers() {
            try {
                const userList = await getAllUsers();
                setUsers(userList);
            } catch (err) {
                console.error("Failed to load users:", err);
            } finally {
                setLoading(false);
            }
        }
        loadUsers();
    }, []);

    return (
        <div className="members-page">
            <div className="members-header">
                <h2><FiUsers /> Campus Members</h2>
                <p>Connect with other students across IGIT Sarang.</p>
            </div>

            {loading ? (
                <div className="members-loading">Loading members...</div>
            ) : (
                <div className="members-grid">
                    {users.map(user => (
                        <div key={user.id} className="member-card animate-fadeIn">
                            <div className="member-avatar-wrapper">
                                <img src={user.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marketplace'} alt={user.displayName} className="member-avatar" />
                            </div>
                            <div className="member-info">
                                <h3 className="member-name">{user.displayName || 'Anonymous'}</h3>
                                {user.major && <p className="member-detail"><FiBookOpen /> {user.major}</p>}
                                {user.location && <p className="member-detail"><FiMapPin /> {user.location}</p>}
                                {user.classYear && <span className="member-badge">{user.classYear}</span>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
