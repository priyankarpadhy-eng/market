import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import './Layout.css';

export default function Layout({ children }) {
    return (
        <>
            <Navbar />
            <div className="layout">
                <Sidebar />
                <main className="layout-content">
                    {children || <Outlet />}
                </main>
            </div>
        </>
    );
}
