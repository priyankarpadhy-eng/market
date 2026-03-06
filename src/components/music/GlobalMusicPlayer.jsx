import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiX, FiMaximize2, FiMusic, FiExternalLink } from 'react-icons/fi';
import './GlobalMusic.css';

export default function GlobalMusicPlayer() {
    const location = useLocation();
    const navigate = useNavigate();
    const [hasOpened, setHasOpened] = useState(false);
    const [closed, setClosed] = useState(false);

    const isMusicPath = location.pathname === '/music';

    useEffect(() => {
        if (isMusicPath) {
            setHasOpened(true);
            setClosed(false);
        }
    }, [isMusicPath]);

    if (!hasOpened) return null;

    const isMini = !isMusicPath;

    // If it's mini mode and closed, we keep the player mounted but hide it with CSS to prevent iframe reloading,
    // or we unmount it completely? If we unmount it, music stops. Let's unmount it completely if the user clicks X.
    if (isMini && closed) return null;

    const playerUrl = window.location.hostname === 'localhost' ? 'http://localhost:5174' : 'https://monochrome.tf';

    return (
        <div className={`global-music-container ${isMini ? 'mini-player' : 'full-page'}`}>
            {isMini && (
                <div className="mini-player-header">
                    <div className="mini-brand" onClick={() => navigate('/music')}>
                        <div className="mini-dot"></div>
                        <FiMusic className="mini-icon" />
                        <span>Monochrome</span>
                    </div>
                    <div className="mini-actions">
                        <button onClick={() => navigate('/music')} title="Open Fullscreen" className="mini-btn"><FiMaximize2 /></button>
                        <button onClick={() => setClosed(true)} title="Close Engine" className="mini-btn close-btn"><FiX /></button>
                    </div>
                </div>
            )}

            <iframe
                src={playerUrl}
                className="global-music-iframe"
                title="Monochrome Player"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            />

            {/* When Full Screen, we show the disclaimer just like the original Music page */}
            {!isMini && (
                <div className="full-page-footer">
                    <p>Note: We do not host the music player or store any music on our servers. This is an integrated third-party experience.</p>
                </div>
            )}
        </div>
    );
}

