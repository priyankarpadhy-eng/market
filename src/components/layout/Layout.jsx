import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import MobileNavbar from './MobileNavbar';
import './Layout.css';

import GlobalMusicPlayer from '../music/GlobalMusicPlayer';

export default function Layout({ children }) {
    return (
        <div className="layout-wrapper">
            <Navbar />
            <div className="layout">
                <Sidebar />
                <main className="layout-content">
                    {children || <Outlet />}
                    <GlobalMusicPlayer />
                </main>
            </div>
            <MobileNavbar />
        </div>
    );
}
