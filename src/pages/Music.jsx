import './Music.css';

export default function Music() {
    // The actual music player iframe is now globally managed in Layout.jsx -> GlobalMusicPlayer.jsx
    // This allows music to keep playing seamlessly when navigating to other app pages.
    // This component simply acts as an anchor/spacer to push the layout wrapper boundaries.

    return (
        <div style={{ width: '100%', minHeight: 'calc(100vh - 120px)' }}></div>
    );
}
