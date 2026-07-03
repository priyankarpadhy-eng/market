import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import MobileNavbar from './MobileNavbar';
import './Layout.css';

import GlobalMusicPlayer from '../music/GlobalMusicPlayer';

export default function Layout({ children }) {
    const location = useLocation();
    const isEventsPage = location.pathname === '/events';

    return (
        <div className="layout-wrapper">
            {!isEventsPage && <Navbar />}
            <div className={`layout${isEventsPage ? ' layout--no-navbar' : ''}`}>
                <Sidebar />
                <main className="layout-content">
                    {children || <Outlet />}
                    <GlobalMusicPlayer />
                </main>
            </div>
            {!isEventsPage && <MobileNavbar />}
        </div>
    );
}
