import EventsPanel from './EventsPanel';
import './RightSidebar.css';

export default function RightSidebar() {
    return (
        <aside className="right-sidebar" id="right-sidebar">
            <EventsPanel />

            {/* Footer */}
            <div className="sidebar-footer">
                <div className="sidebar-footer-links">
                    <a href="/support">Support</a>
                    <a href="/privacy">Privacy</a>
                    <a href="/terms">Terms</a>
                </div>
                <span className="sidebar-footer-copyright">© 2025 CampusConnect</span>
            </div>
        </aside>
    );
}
