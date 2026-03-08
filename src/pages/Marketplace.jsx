import { useState, useEffect } from 'react';
import { FiSearch, FiFilter, FiChevronDown, FiPlus, FiGrid, FiBook, FiMonitor, FiShoppingBag, FiHome } from 'react-icons/fi';
import { MdChair } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import ListingCard from '../components/marketplace/ListingCard';
import { subscribeToListings, createListing } from '../firebase/services';
import { useAuth } from '../contexts/AuthContext';
import { uploadFile } from '../lib/storage';
import './Marketplace.css';

const marketplaceCategories = ['All', 'Textbooks', 'Furniture', 'Electronics', 'Clothing', 'Housing'];

const categoryIcons = {
    'All': FiGrid,
    'Textbooks': FiBook,
    'Furniture': MdChair,
    'Electronics': FiMonitor,
    'Clothing': FiShoppingBag,
    'Housing': FiHome,
};

export default function Marketplace() {
    const { currentUser } = useAuth();
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [listings, setListings] = useState([]);
    const [showListModal, setShowListModal] = useState(false);
    const [newItem, setNewItem] = useState({
        title: '',
        price: '',
        category: 'Textbooks',
        condition: 'Good',
        description: '',
        location: '',
        mobileNumber: ''
    });
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        let unsubscribe;
        try {
            unsubscribe = subscribeToListings(activeCategory, searchQuery, (data) => {
                setListings(data || []);
            });
        } catch (err) {
            console.error('Marketplace subs error:', err);
        }
        return () => unsubscribe && unsubscribe();
    }, [activeCategory, searchQuery]);

    const handleListItem = async () => {
        if (!newItem.title || !newItem.price || !newItem.location || !newItem.mobileNumber) {
            setErrorMsg('Title, Price, Location, and Mobile Number are required.');
            return;
        }

        setUploading(true);
        setErrorMsg('');
        const defaultImages = {
            'Textbooks': '/images/textbook.png',
            'Furniture': 'https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&w=600&q=80',
            'Electronics': 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=600&q=80',
            'Clothing': 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=600&q=80',
            'Housing': 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80'
        };
        let imageUrl = defaultImages[newItem.category] || '/images/logo.png';
        if (file) {
            try {
                imageUrl = await uploadFile(file, 'listings');
            } catch (err) {
                setErrorMsg(err.message);
                setUploading(false);
                return;
            }
        }

        const listing = {
            ...newItem,
            price: parseFloat(newItem.price),
            priceUnit: '',
            image: imageUrl,
            seller: currentUser?.displayName || 'Anonymous Student',
            sellerId: currentUser?.uid || 'guest',
            sellerAvatar: currentUser?.photoURL || null,
            timeAgo: 'Just now', // The backend uses serverTimestamp()
        };
        try {
            await createListing(listing);
        } catch { /* continue with local */ }
        setShowListModal(false);
        setNewItem({ title: '', price: '', category: 'Textbooks', condition: 'Good', description: '', location: '', mobileNumber: '' });
        setFile(null);
        setUploading(false);
    };

    return (
        <div className="marketplace-page">
            <div className="marketplace-header">
                <div>
                    <h1 className="marketplace-title">Marketplace</h1>
                    <p className="marketplace-subtitle">Discover items from fellow IGITIANS — for IGITIANS</p>
                </div>
                <button className="marketplace-list-btn" id="list-item-btn" onClick={() => setShowListModal(true)}>
                    <FiPlus />
                    <span>List an Item</span>
                </button>
            </div>

            <div className="marketplace-search-row">
                <div className="marketplace-search">
                    <FiSearch className="marketplace-search-icon" />
                    <input
                        type="text"
                        placeholder="Search for textbooks, electronics, furniture..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        id="marketplace-search"
                    />
                </div>
                <button className="marketplace-filter-btn">
                    <FiFilter />
                    Filter
                </button>
                <button className="marketplace-filter-btn">
                    Condition
                    <FiChevronDown />
                </button>
            </div>

            <div className="marketplace-categories">
                {marketplaceCategories.map((cat) => {
                    const Icon = categoryIcons[cat] || FiGrid;
                    return (
                        <button
                            key={cat}
                            className={`marketplace-category-btn ${activeCategory === cat ? 'active' : ''}`}
                            onClick={() => setActiveCategory(cat)}
                            id={`category-${cat.toLowerCase()}`}
                        >
                            <Icon />
                            {cat}
                        </button>
                    );
                })}
            </div>

            <motion.div layout className="marketplace-grid">
                <AnimatePresence>
                    {listings.map((listing, i) => (
                        <ListingCard key={listing.id} listing={listing} index={i} />
                    ))}
                </AnimatePresence>
            </motion.div>

            {listings.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>
                    No items found. Try a different search or category.
                </div>
            )}

            <button className="marketplace-load-more" id="load-more-btn">
                Load More Items
            </button>

            {/* List Item Modal */}
            <AnimatePresence>
                {showListModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="profile-modal-overlay" onClick={() => setShowListModal(false)} style={{ zIndex: 2000 }}>
                        <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="profile-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '20px' }}>List an Item</h2>
                            {errorMsg && (
                                <div style={{ padding: '10px', background: '#fee2e2', color: '#dc2626', borderRadius: '6px', marginBottom: '15px', fontSize: '0.85rem' }}>
                                    {errorMsg}
                                </div>
                            )}
                            <div className="profile-modal-field">
                                <label>Title</label>
                                <input type="text" placeholder="What are you selling?" value={newItem.title} onChange={e => setNewItem(p => ({ ...p, title: e.target.value }))} />
                            </div>
                            <div className="profile-modal-field">
                                <label>Price (₹)</label>
                                <input type="number" placeholder="0.00" value={newItem.price} onChange={e => setNewItem(p => ({ ...p, price: e.target.value }))} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div className="profile-modal-field">
                                    <label>Category</label>
                                    <select style={{ width: '100%', padding: '12px 16px', background: 'var(--bg-main)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', fontSize: '0.9rem' }} value={newItem.category} onChange={e => setNewItem(p => ({ ...p, category: e.target.value }))}>
                                        {marketplaceCategories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="profile-modal-field">
                                    <label>Condition</label>
                                    <select style={{ width: '100%', padding: '12px 16px', background: 'var(--bg-main)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', fontSize: '0.9rem' }} value={newItem.condition} onChange={e => setNewItem(p => ({ ...p, condition: e.target.value }))}>
                                        <option>New</option><option>Like New</option><option>Good</option><option>Fair</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                                <div className="profile-modal-field">
                                    <label>Location</label>
                                    <input type="text" placeholder="e.g. West Hostel, Block C" value={newItem.location} onChange={e => setNewItem(p => ({ ...p, location: e.target.value }))} />
                                </div>
                                <div className="profile-modal-field">
                                    <label>Mobile Number</label>
                                    <input type="tel" placeholder="10-digit number" value={newItem.mobileNumber} onChange={e => setNewItem(p => ({ ...p, mobileNumber: e.target.value }))} />
                                </div>
                            </div>

                            <div className="profile-modal-field">
                                <label>Description</label>
                                <textarea placeholder="Describe your item..." value={newItem.description} onChange={e => setNewItem(p => ({ ...p, description: e.target.value }))} style={{ minHeight: '80px' }} />
                            </div>
                            <div className="profile-modal-field">
                                <label>Image (Max 5MB)</label>
                                <input type="file" accept="image/*" onChange={e => {
                                    if (e.target.files[0] && e.target.files[0].size > 5 * 1024 * 1024) {
                                        setErrorMsg('File limit is 5MB.');
                                        e.target.value = null; // clear
                                    } else {
                                        setFile(e.target.files[0]);
                                        setErrorMsg('');
                                    }
                                }} />
                            </div>
                            <div className="profile-modal-actions">
                                <button className="profile-modal-cancel" onClick={() => setShowListModal(false)} disabled={uploading}>Cancel</button>
                                <button className="profile-modal-save" onClick={handleListItem} disabled={uploading}>
                                    {uploading ? 'Uploading...' : 'List Item'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
