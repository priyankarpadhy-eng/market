import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { isNicknameAvailable } from '../firebase/services';
import './Auth.css';

export default function Auth() {
    const location = useLocation();
    const navigate = useNavigate();
    const { login, signup, resetPassword, loginAsGuest } = useAuth();

    const [authMode, setAuthMode] = useState(location.state?.mode || 'login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [signupData, setSignupData] = useState({ name: '', major: '', classYear: '' });
    const [guestName, setGuestName] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState('https://api.dicebear.com/7.x/avataaars/svg?seed=Marketplace');
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [loading, setLoading] = useState(false);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [nicknameStatus, setNicknameStatus] = useState({ checking: false, available: true, message: '' });

    useEffect(() => {
        const nameToCheck = authMode === 'signup' ? signupData.name : guestName;
        if (nameToCheck.length < 3) {
            setNicknameStatus({ checking: false, available: true, message: '' });
            return;
        }

        const timer = setTimeout(async () => {
            setNicknameStatus(prev => ({ ...prev, checking: true }));
            try {
                const isAvailable = await isNicknameAvailable(nameToCheck);
                setNicknameStatus({
                    checking: false,
                    available: isAvailable,
                    message: isAvailable ? '✓ Nickname is available' : '✗ This nickname is already taken'
                });
            } catch (err) {
                setNicknameStatus({ checking: false, available: true, message: '' });
            }
        }, 600);

        return () => clearTimeout(timer);
    }, [signupData.name, guestName, authMode]);

    const avatars = [
        { id: 'TECH', url: '/avatars/tech.png' },
        { id: 'SCHOLAR', url: '/avatars/scholar.png' },
        { id: 'ARTIST', url: '/avatars/artist.png' },
        { id: 'ATHLETE', url: '/avatars/athlete.png' },
        { id: 'MUSICIAN', url: '/avatars/musician.png' },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMsg('');
        setLoading(true);

        try {
            if (authMode === 'login') {
                await login(email, password);
                navigate('/');
            } else if (authMode === 'signup') {
                await signup(email, password, signupData.name, {
                    major: signupData.major,
                    classYear: signupData.classYear,
                    photoURL: selectedAvatar
                });
                setSuccessMsg('Account created! Please verify your email before logging in.');
                setAuthMode('login');
            } else if (authMode === 'reset') {
                await resetPassword(email);
                setSuccessMsg('Password reset email sent! Check your inbox.');
                setAuthMode('login');
            } else if (authMode === 'guest') {
                await loginAsGuest(guestName, selectedAvatar);
                navigate('/');
            }
        } catch (err) {
            const msg = err.code === 'auth/user-not-found' ? 'No account found with this email'
                : err.code === 'auth/wrong-password' ? 'Incorrect password'
                    : err.code === 'auth/email-already-in-use' ? 'An account with this email already exists'
                        : err.code === 'auth/weak-password' ? 'Password must be at least 6 characters'
                            : err.code === 'auth/invalid-email' ? 'Invalid email address'
                                : err.message || 'An error occurred';
            setError(msg);
        }
        setLoading(false);
    };

    const handleRandomizeAvatar = () => {
        const random = avatars[Math.floor(Math.random() * avatars.length)];
        setSelectedAvatar(random.url);
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <div className="auth-logo">
                    <img src="/images/logo.png" alt="Marketplace Logo" className="auth-logo-img" />
                </div>

                {authMode !== 'guest' ? (
                    <>
                        <h1 className="auth-title">
                            {authMode === 'login' ? 'Welcome Back'
                                : authMode === 'signup' ? 'Create Account'
                                    : 'Reset Password'}
                        </h1>
                        <p className="auth-subtitle">
                            {authMode === 'login' ? 'Sign in to continue to Marketplace'
                                : authMode === 'signup' ? 'Join the IGITIANS community today'
                                    : 'Enter your email to reset your password'}
                        </p>
                    </>
                ) : (
                    <>
                        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
                            <div style={{ background: '#e0e7ff', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            </div>
                        </div>
                        <h1 className="auth-title">Guest Login</h1>
                        <p className="auth-subtitle">Join the circle anonymously to explore campus life.</p>
                    </>
                )}

                {error && <p style={{ color: 'var(--danger)', textAlign: 'center', fontSize: '0.85rem', marginBottom: '12px', padding: '8px 12px', background: '#fff5f5', borderRadius: 'var(--radius-md)' }}>{error}</p>}
                {successMsg && <p style={{ color: '#10b981', textAlign: 'center', fontSize: '0.85rem', marginBottom: '12px', padding: '8px 12px', background: '#ecfdf5', border: '1px solid #10b981', borderRadius: 'var(--radius-md)' }}>{successMsg}</p>}

                <form className="auth-form" onSubmit={handleSubmit}>
                    {(authMode === 'guest' || authMode === 'signup') && (
                        <div className="auth-field">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <label>Choose your Avatar</label>
                                <button type="button" onClick={handleRandomizeAvatar} style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.8rem', cursor: 'pointer', fontWeight: 600 }}>Randomize</button>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', flexWrap: 'wrap', gap: '8px' }}>
                                {avatars.map((avatar) => (
                                    <div key={avatar.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }} onClick={() => setSelectedAvatar(avatar.url)}>
                                        <div style={{
                                            width: '46px', height: '46px', borderRadius: '50%', background: '#f1f5f9',
                                            border: selectedAvatar === avatar.url ? '2px solid #2563eb' : '2px solid transparent',
                                            padding: '2px', overflow: 'hidden'
                                        }}>
                                            <img src={avatar.url} alt={avatar.id} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                                        </div>
                                        <span style={{ fontSize: '0.65rem', fontWeight: 700, color: selectedAvatar === avatar.url ? '#2563eb' : '#94a3b8' }}>{avatar.id}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {authMode === 'guest' ? (
                        <>
                            <div className="auth-field">
                                <label htmlFor="guestName">Display Name</label>
                                <div style={{ position: 'relative' }}>
                                    <span style={{ position: 'absolute', left: '12px', top: '12px', color: '#94a3b8' }}>@</span>
                                    <input
                                        type="text"
                                        id="guestName"
                                        style={{
                                            paddingLeft: '32px',
                                            borderColor: !nicknameStatus.available ? '#ef4444' : (nicknameStatus.message ? '#10b981' : 'var(--border-medium)')
                                        }}
                                        placeholder="e.g. FriendlyGecko42"
                                        value={guestName}
                                        onChange={(e) => setGuestName(e.target.value)}
                                        required
                                    />
                                    {nicknameStatus.message && (
                                        <p style={{
                                            fontSize: '0.75rem',
                                            marginTop: '4px',
                                            color: nicknameStatus.available ? '#10b981' : '#ef4444',
                                            fontWeight: 600
                                        }}>
                                            {nicknameStatus.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                        </>
                    ) : (
                        <>
                            {authMode === 'signup' && (
                                <>
                                    <div className="auth-field">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <label htmlFor="name">Username / Nickname</label>
                                            <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 500 }}>Use a nickname for privacy</span>
                                        </div>
                                        <input
                                            type="text"
                                            id="name"
                                            placeholder="e.g. FriendlyGecko42"
                                            value={signupData.name}
                                            onChange={(e) => setSignupData(prev => ({ ...prev, name: e.target.value }))}
                                            required
                                            style={{
                                                borderColor: !nicknameStatus.available ? '#ef4444' : (nicknameStatus.message ? '#10b981' : 'var(--border-medium)')
                                            }}
                                        />
                                        {nicknameStatus.message && (
                                            <p style={{
                                                fontSize: '0.75rem',
                                                marginTop: '4px',
                                                color: nicknameStatus.available ? '#10b981' : '#ef4444',
                                                fontWeight: 600
                                            }}>
                                                {nicknameStatus.message}
                                            </p>
                                        )}
                                        <p style={{ fontSize: '0.65rem', color: '#94a3b8', marginTop: '4px' }}>Please avoid using your real name unless absolutely necessary.</p>
                                    </div>
                                    <div className="auth-field">
                                        <label htmlFor="major">Major / Department</label>
                                        <select
                                            id="major"
                                            value={signupData.major}
                                            onChange={(e) => setSignupData(prev => ({ ...prev, major: e.target.value }))}
                                            required
                                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-medium)', background: 'var(--bg-white)' }}
                                        >
                                            <option value="">Select your department</option>
                                            <option value="Computer Science">Computer Science</option>
                                            <option value="Mechanical">Mechanical</option>
                                            <option value="Civil">Civil</option>
                                            <option value="Electrical">Electrical</option>
                                            <option value="Electronics">Electronics</option>
                                            <option value="Chemical">Chemical</option>
                                            <option value="Production">Production</option>
                                            <option value="Metallurgy">Metallurgy</option>
                                        </select>
                                    </div>
                                    <div className="auth-field">
                                        <label htmlFor="classYear">Passout Year</label>
                                        <select
                                            id="classYear"
                                            value={signupData.classYear}
                                            onChange={(e) => setSignupData(prev => ({ ...prev, classYear: e.target.value }))}
                                            required
                                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid var(--border-medium)', background: 'var(--bg-white)' }}
                                        >
                                            <option value="">Select your passout year</option>
                                            {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() + 5 - i).map(year => (
                                                <option key={year} value={year}>{year}</option>
                                            ))}
                                        </select>
                                    </div>
                                </>
                            )}
                            <div className="auth-field">
                                <label htmlFor="email">{authMode === 'login' ? 'Email or Nickname' : 'Email'}</label>
                                <input
                                    type={authMode === 'login' ? 'text' : 'email'}
                                    id="email"
                                    placeholder={authMode === 'login' ? 'Enter your email or nickname' : 'Enter your email'}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            {authMode !== 'reset' && (
                                <div className="auth-field">
                                    <label htmlFor="password">Password</label>
                                    <input
                                        type="password"
                                        id="password"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={6}
                                    />
                                </div>
                            )}
                        </>
                    )}

                    {authMode === 'login' && (
                        <div style={{ textAlign: 'right', marginTop: '-10px', marginBottom: '10px' }}>
                            <button type="button" onClick={() => { setAuthMode('reset'); setError(''); setSuccessMsg(''); }} style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '0.85rem', cursor: 'pointer' }}>
                                Forgot password?
                            </button>
                        </div>
                    )}

                    {(authMode === 'signup' || authMode === 'guest') && (
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', marginTop: '16px', marginBottom: '20px', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                            <input
                                type="checkbox"
                                id="terms"
                                checked={termsAccepted}
                                onChange={(e) => setTermsAccepted(e.target.checked)}
                                required
                                style={{ marginTop: '2px', minWidth: '16px', height: '16px', cursor: 'pointer', accentColor: '#2563eb' }}
                            />
                            <label htmlFor="terms" style={{ fontSize: '0.8rem', color: '#475569', lineHeight: '1.5', cursor: 'pointer' }}>
                                I confirm that I am a student and I agree to the <Link to="/terms" target="_blank" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>Terms and Conditions</Link> & <Link to="/privacy" target="_blank" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: 600 }}>Privacy Policy</Link>. I understand my responsibility on this platform.
                            </label>
                        </div>
                    )}

                    <button type="submit" className="auth-submit-btn" id="auth-submit" disabled={loading || ((authMode === 'signup' || authMode === 'guest') && (!termsAccepted || !nicknameStatus.available))} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                        {loading ? 'Please wait...'
                            : authMode === 'login' ? 'Sign In'
                                : authMode === 'signup' ? 'Create Account'
                                    : authMode === 'reset' ? 'Send Reset Link'
                                        : <>Continue as Guest <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7" /></svg></>}
                    </button>

                    {authMode === 'guest' && (
                        <button type="button" onClick={() => setAuthMode('login')} style={{ width: '100%', padding: '12px', background: 'transparent', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)', color: '#475569', fontWeight: 600, marginTop: '12px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3" /></svg>
                            Back to Login
                        </button>
                    )}
                </form>

                {authMode !== 'guest' && (
                    <>
                        <button className="auth-google-btn" style={{ marginTop: '12px' }} onClick={() => setAuthMode('guest')} disabled={loading}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            Continue as Guest
                        </button>

                        <div className="auth-switch">
                            {authMode === 'login' ? "Don't have an account? " : authMode === 'signup' ? "Already have an account? " : "Remember your password? "}
                            <button onClick={() => { setAuthMode(authMode === 'login' ? 'signup' : 'login'); setError(''); setSuccessMsg(''); }}>
                                {authMode === 'login' ? 'Sign Up' : 'Sign In'}
                            </button>
                        </div>
                    </>
                )}

                {authMode === 'guest' && (
                    <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.75rem', color: '#64748b' }}>
                        Guest accounts have limited access to messaging features.
                    </div>
                )}
            </div>
        </div>
    );
}
