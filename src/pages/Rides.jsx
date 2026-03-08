import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { subscribeToRides, createRide } from '../firebase/services';
import RideCard from '../components/rides/RideCard';
import CreateRideModal from '../components/rides/CreateRideModal';
import { FiPlus, FiFilter, FiSearch, FiMap } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import './Rides.css';

export default function Rides() {
    const { currentUser } = useAuth();
    const [rides, setRides] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterGender, setFilterGender] = useState('All');

    useEffect(() => {
        const unsubscribe = subscribeToRides((data) => {
            setRides(data);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const filteredRides = rides.filter(ride => {
        const matchesSearch =
            ride.from?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            ride.to?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesGender = filterGender === 'All' || ride.genderPreference === filterGender;
        const isActive = ride.status !== 'cancelled';
        return matchesSearch && matchesGender && isActive;
    });

    return (
        <div className="rides-page">
            <header className="rides-header">
                <div className="header-info">
                    <h1>Campus <span className="text-gradient">Ride Share</span></h1>
                    <p>Connect with peers for safe and social commutes.</p>
                </div>
                <button
                    className="create-ride-btn"
                    onClick={() => {
                        if (currentUser?.role === 'shop') {
                            alert("Only students can organize rides.");
                            return;
                        }
                        setShowCreateModal(true);
                    }}
                >
                    <FiPlus /> Organize a Ride
                </button>
            </header>

            <div className="rides-controls">
                <div className="search-bar">
                    <FiSearch />
                    <input
                        type="text"
                        placeholder="Search destination (e.g. Talcher, BBSR)..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <FiFilter />
                    <select value={filterGender} onChange={(e) => setFilterGender(e.target.value)}>
                        <option value="All">All Rides</option>
                        <option value="Male Only">Male Only</option>
                        <option value="Female Only">Female Only</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="rides-loading">
                    <div className="spinner"></div>
                    <p>Finding available rides...</p>
                </div>
            ) : filteredRides.length === 0 ? (
                <div className="no-rides">
                    <div className="empty-state-icon">
                        <FiMap size={48} />
                    </div>
                    <h3>No rides found</h3>
                    <p>Try searching for a different destination or organize one yourself!</p>
                </div>
            ) : (
                <div className="rides-grid">
                    <AnimatePresence>
                        {filteredRides.map((ride, index) => (
                            <RideCard key={ride.id} ride={ride} index={index} />
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {showCreateModal && (
                <CreateRideModal onClose={() => setShowCreateModal(false)} />
            )}
        </div>
    );
}
