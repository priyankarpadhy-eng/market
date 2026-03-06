import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import './Layout.css';

import GlobalMusicPlayer from '../music/GlobalMusicPlayer';

export default function Layout({ children }) {
    return (
        <>
            <Navbar />
            <div className="layout">
                <Sidebar />
                <main className="layout-content" style={{ position: 'relative' }}>
                    {children || <Outlet />}
                    <GlobalMusicPlayer />
                </main>
            </div>
        </>
    );
}
