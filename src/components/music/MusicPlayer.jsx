import { useState } from 'react';
import { FiMaximize2, FiMusic, FiExternalLink } from 'react-icons/fi';
import './MusicPlayer.css';

export default function MusicPlayer() {
    const playerUrl = window.location.hostname === 'localhost' ? 'http://localhost:5174' : 'https://monochrome.tf';

    return (
        <div className="monochrome-sidebar-integrated">
            <div className="monochrome-header">
                <div className="header-brand">
                    <div className="brand-dot"></div>
                    <FiMusic className="brand-icon" />
                    <span>Monochrome</span>
                </div>
                <div className="header-actions">
                    <a href={playerUrl} target="_blank" rel="noopener noreferrer" className="sidebar-action-btn" title="Open Dashboard">
                        <FiExternalLink />
                    </a>
                </div>
            </div>

            <div className="monochrome-iframe-wrapper">
                <iframe
                    src={playerUrl}
                    className="monochrome-embedded-iframe"
                    title="Monochrome Player"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                />
            </div>

            <div className="monochrome-footer">
                <span className="footer-engine">High Fidelity Audio Engine</span>
                <span className="footer-disclaimer">Third-party content. Not hosted or stored by us.</span>
            </div>
        </div>
    );
}
