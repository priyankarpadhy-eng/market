import './Music.css';

export default function Music() {
    const playerUrl = window.location.hostname === 'localhost' ? 'http://localhost:5174' : 'https://monochrome.tf';

    return (
        <div className="music-page">
            <iframe
                src={playerUrl}
                className="music-page-iframe"
                title="Monochrome Player"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            />
        </div>
    );
}
