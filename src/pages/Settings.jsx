import { useState, useEffect } from 'react';
import { FiUser, FiBookOpen, FiChevronRight, FiSun, FiMoon, FiSettings } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { getUserSettings, saveUserSettings, getUserProfile } from '../firebase/services';
import { defaultSettings, userProfile as localProfile } from '../data/extraData';
import './Settings.css'; // Refreshed component to resolve import error

export default function Settings() {
    const { currentUser } = useAuth();
    const [settings, setSettings] = useState(defaultSettings);
    const [profile, setProfile] = useState(localProfile);
    const [toastMsg, setToastMsg] = useState('');
    const [showToast, setShowToast] = useState(false);

    // Load settings from Firestore
    useEffect(() => {
        async function loadSettings() {
            try {
                const uid = currentUser?.uid || 'demo-user-1';
                const saved = await getUserSettings(uid);
                if (saved) setSettings(prev => ({ ...prev, ...saved }));
                const prof = await getUserProfile(uid);
                if (prof) setProfile(prof);
            } catch (err) {
                console.log('Settings load fallback:', err.message);
            }
        }
        loadSettings();
    }, [currentUser]);

    const showSavedToast = (msg) => {
        setToastMsg(msg);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2500);
    };

    const persistSettings = async (newSettings) => {
        try {
            const uid = currentUser?.uid || 'demo-user-1';
            await saveUserSettings(uid, newSettings);
        } catch (err) {
            console.log('Settings save fallback:', err.message);
        }
    };



    const setTheme = (theme) => {
        const updated = { ...settings, theme };
        setSettings(updated);
        persistSettings(updated);
        showSavedToast(`Theme set to ${theme}`);

        if (theme === 'dark') {
            document.documentElement.style.setProperty('--bg-main', '#0f172a');
            document.documentElement.style.setProperty('--bg-white', '#1e293b');
            document.documentElement.style.setProperty('--bg-elevated', '#1e293b');
            document.documentElement.style.setProperty('--bg-hover', '#334155');
            document.documentElement.style.setProperty('--bg-active', '#475569');
            document.documentElement.style.setProperty('--text-primary', '#f1f5f9');
            document.documentElement.style.setProperty('--text-secondary', '#94a3b8');
            document.documentElement.style.setProperty('--text-tertiary', '#64748b');
            document.documentElement.style.setProperty('--border-light', '#334155');
            document.documentElement.style.setProperty('--border-medium', '#475569');
        } else {
            document.documentElement.style.setProperty('--bg-main', '#f8f9fb');
            document.documentElement.style.setProperty('--bg-white', '#ffffff');
            document.documentElement.style.setProperty('--bg-elevated', '#ffffff');
            document.documentElement.style.setProperty('--bg-hover', '#f1f5f9');
            document.documentElement.style.setProperty('--bg-active', '#e2e8f0');
            document.documentElement.style.setProperty('--text-primary', '#0f172a');
            document.documentElement.style.setProperty('--text-secondary', '#475569');
            document.documentElement.style.setProperty('--text-tertiary', '#94a3b8');
            document.documentElement.style.setProperty('--border-light', '#e2e8f0');
            document.documentElement.style.setProperty('--border-medium', '#cbd5e1');
        }
    };

    const setDensity = (density) => {
        const updated = { ...settings, contentDensity: density };
        setSettings(updated);
        persistSettings(updated);
        showSavedToast(`Content density: ${density}`);
    };

    return (
        <div className="settings-page">
            <h1 className="settings-title">Settings</h1>

            <div className="settings-section">
                <h2 className="settings-section-title">Account</h2>
                <div className="settings-account-item" id="settings-profile-info">
                    <div className="settings-account-icon"><FiUser /></div>
                    <div className="settings-account-info">
                        <div className="settings-account-label">Profile Information</div>
                        <div className="settings-account-value">{profile.displayName} • {profile.email}</div>
                    </div>
                    <FiChevronRight className="settings-account-arrow" />
                </div>
                <div className="settings-account-item" id="settings-campus">
                    <div className="settings-account-icon"><FiBookOpen /></div>
                    <div className="settings-account-info">
                        <div className="settings-account-label">College & Major</div>
                        <div className="settings-account-value">{profile.university || 'IGIT Sarang'} • {profile.major || 'Computer Science'}</div>
                    </div>
                    <FiChevronRight className="settings-account-arrow" />
                </div>
            </div>

            <div className="settings-section">
                <h2 className="settings-section-title">Community</h2>
                <a
                    href="https://chat.whatsapp.com/L18veuCIe5b1uFiaCCjcLa"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="settings-account-item"
                    style={{ textDecoration: 'none' }}
                >
                    <div className="settings-account-icon" style={{ background: '#25D366', color: 'white' }}>
                        <FaWhatsapp size={20} />
                    </div>
                    <div className="settings-account-info">
                        <div className="settings-account-label">WhatsApp Community</div>
                        <div className="settings-account-value">Join official IGIT Marketplace group</div>
                    </div>
                    <FiChevronRight className="settings-account-arrow" />
                </a>
            </div>



            <div className="settings-section">
                <h2 className="settings-section-title">Display</h2>
                <div className="settings-theme-label">Theme Mode</div>
                <div className="settings-theme-options">
                    <button className={`settings-theme-option ${settings.theme === 'light' ? 'active' : ''}`} onClick={() => setTheme('light')} id="theme-light"><FiSun /> Light</button>
                    <button className={`settings-theme-option ${settings.theme === 'dark' ? 'active' : ''}`} onClick={() => setTheme('dark')} id="theme-dark"><FiMoon /> Dark</button>
                    <button className={`settings-theme-option ${settings.theme === 'system' ? 'active' : ''}`} onClick={() => setTheme('system')} id="theme-system"><FiSettings /> System</button>
                </div>
                <div className="settings-density-label">Content Density</div>
                <select className="settings-density-select" value={settings.contentDensity} onChange={(e) => setDensity(e.target.value)} id="density-select">
                    <option value="comfortable">Comfortable</option>
                    <option value="compact">Compact</option>
                </select>
            </div>



            <div className="settings-footer">
                <div className="settings-footer-version">Marketplace Version 2.4.0 (Build 892)</div>
                <div className="settings-footer-links">
                    <a href="#">Privacy Policy</a>
                    <a href="#">Terms of Service</a>
                    <a href="#">Help Center</a>
                </div>
            </div>

            <div className={`settings-toast ${showToast ? 'visible' : ''}`}>{toastMsg}</div>
        </div>
    );
}
