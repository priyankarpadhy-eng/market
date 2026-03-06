import { useState, useEffect } from 'react';
import { FiUser, FiBookOpen, FiChevronRight, FiLock, FiShield, FiSun, FiMoon, FiSettings } from 'react-icons/fi';
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

    const toggleSetting = (key) => {
        const updated = { ...settings, [key]: !settings[key] };
        setSettings(updated);
        persistSettings(updated);
        showSavedToast('Settings saved ✓');
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
                <h2 className="settings-section-title">Notifications</h2>
                <div className="settings-toggle-row">
                    <div>
                        <div className="settings-toggle-label">Push Notifications</div>
                        <div className="settings-toggle-desc">Receive alerts for mentions and circle updates</div>
                    </div>
                    <label className="settings-toggle">
                        <input type="checkbox" checked={settings.pushNotifications} onChange={() => toggleSetting('pushNotifications')} id="toggle-push" />
                        <div className="settings-toggle-track" />
                        <div className="settings-toggle-thumb" />
                    </label>
                </div>
                <div className="settings-toggle-row">
                    <div>
                        <div className="settings-toggle-label">Email Digest</div>
                        <div className="settings-toggle-desc">Weekly summary of IGIT activities</div>
                    </div>
                    <label className="settings-toggle">
                        <input type="checkbox" checked={settings.emailDigest} onChange={() => toggleSetting('emailDigest')} id="toggle-email" />
                        <div className="settings-toggle-track" />
                        <div className="settings-toggle-thumb" />
                    </label>
                </div>
            </div>

            <div className="settings-section">
                <h2 className="settings-section-title">Privacy & Security</h2>
                <div className="settings-security-row">
                    <div className="settings-security-card" id="change-password-btn">
                        <div className="settings-security-icon lock"><FiLock /></div>
                        <div>
                            <div className="settings-security-label">Change Password</div>
                            <div className="settings-security-desc">Update your account security</div>
                        </div>
                    </div>
                    <div className="settings-security-card" id="two-factor-btn">
                        <div className="settings-security-icon shield"><FiShield /></div>
                        <div>
                            <div className="settings-security-label">Two-Factor Auth</div>
                            <div className="settings-security-desc">Enable extra protection</div>
                        </div>
                    </div>
                </div>
                <div className="settings-toggle-row">
                    <div><div className="settings-toggle-label">Public Profile</div></div>
                    <label className="settings-toggle">
                        <input type="checkbox" checked={settings.publicProfile} onChange={() => toggleSetting('publicProfile')} id="toggle-public" />
                        <div className="settings-toggle-track" />
                        <div className="settings-toggle-thumb" />
                    </label>
                </div>
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

            <div className="settings-danger">
                <div className="settings-danger-title">Danger Zone</div>
                <p className="settings-danger-text">Deleting your account is permanent and cannot be undone. All your circles, events, and message history will be lost.</p>
                <button className="settings-danger-btn" id="delete-account-btn">Delete Account</button>
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
