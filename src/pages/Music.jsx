import './Music.css';

export default function Music() {
    return (
        <div className="music-page">
            <iframe
                src="http://localhost:5174"
                className="music-page-iframe"
                title="Monochrome Player"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            />
        </div>
    );
}
