import { useState } from 'react';
import { FiPlus, FiX } from 'react-icons/fi';
import CreatePost from './CreatePost';
import './FloatingPostButton.css';

export default function FloatingPostButton() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* FAB Button */}
            <button
                className={`fab-button ${isOpen ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Create Post"
            >
                {isOpen ? <FiX /> : <FiPlus />}
            </button>

            {/* Modal Overlay */}
            {isOpen && (
                <div className="post-modal-overlay" onClick={() => setIsOpen(false)}>
                    <div className="post-modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Create New Post</h3>
                            <button className="close-modal-btn" onClick={() => setIsOpen(false)}>
                                <FiX />
                            </button>
                        </div>
                        <CreatePost onPostSuccess={() => setIsOpen(false)} isModal={true} />
                    </div>
                </div>
            )}
        </>
    );
}
