import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { sendEmailVerification } from 'firebase/auth';

export default function EmailVerificationModal() {
    const { currentUser, authUser, logout } = useAuth();
    const [sending, setSending] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        // Poll for email verification state
        let interval = null;
        if (authUser && !authUser.emailVerified && authUser.uid !== 'demo-user-1' && !authUser.isAnonymous) {
            interval = setInterval(async () => {
                try {
                    await authUser.reload();
                    if (authUser.emailVerified) {
                        window.location.reload();
                    }
                } catch (err) {
                    console.error('Email reload error:', err);
                }
            }, 3000);
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [authUser]);

    const handleResend = async () => {
        setSending(true);
        setMsg('');
        try {
            await sendEmailVerification(authUser);
            setMsg('Verification email resent! Check your inbox.');
        } catch (err) {
            setMsg(err.message || 'Failed to resend email.');
        }
        setSending(false);
    };

    // Use authUser's state for the conditional check
    const isVerified = authUser?.emailVerified;
    const isDemo = authUser?.uid === 'demo-user-1';
    const isGuest = authUser?.isAnonymous;

    if (!authUser || isVerified || isDemo || isGuest) {
        return null;
    }

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
        }}>
            <div style={{
                background: 'var(--bg-white)',
                padding: '30px',
                borderRadius: 'var(--radius-lg)',
                maxWidth: '400px',
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
            }}>
                <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: '#e0e7ff',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 20px',
                    fontSize: '24px'
                }}>
                    📧
                </div>
                <h2 style={{ fontSize: '1.25rem', marginBottom: '10px' }}>Verify Your Email</h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '20px' }}>
                    We sent a verification link to <strong>{authUser?.email}</strong>.
                    Please check your inbox to continue using Marketplace.
                    <br /><br />
                    <em>This page will automatically refresh once verified.</em>
                </p>

                {msg && <div style={{ fontSize: '0.85rem', color: msg.includes('Failed') ? 'var(--danger)' : '#10b981', marginBottom: '16px' }}>{msg}</div>}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button
                        onClick={handleResend}
                        disabled={sending}
                        style={{
                            padding: '12px',
                            background: 'var(--bg-main)',
                            border: '1px solid var(--border-medium)',
                            borderRadius: 'var(--radius-md)',
                            fontWeight: 600,
                            cursor: sending ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {sending ? 'Sending...' : 'Resend Email'}
                    </button>
                    <button
                        onClick={logout}
                        style={{
                            padding: '12px',
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--danger)',
                            cursor: 'pointer',
                            fontWeight: 600
                        }}
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}
