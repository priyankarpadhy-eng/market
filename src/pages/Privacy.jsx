import { Link } from 'react-router-dom';
import { FiArrowLeft, FiShield } from 'react-icons/fi';
import './Landing.css';

export default function Privacy() {
    return (
        <div className="landing-container" style={{ minHeight: '100vh', background: 'var(--lp-bg)' }}>
            {/* Background Details */}
            <div className="bg-shapes">
                <div className="shape shape-1" style={{ top: '-10%', left: '20%', width: '30vw', height: '30vw' }}></div>
                <div className="shape shape-2" style={{ bottom: '-10%', right: '10%' }}></div>
            </div>

            {/* Navigation */}
            <nav className="landing-nav" style={{ position: 'fixed', width: '100%', background: 'rgba(248, 250, 252, 0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'var(--lp-text)', fontWeight: 600 }}>
                    <FiArrowLeft /> Back to Home
                </Link>
                <div className="landing-logo">
                    <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 900, color: 'var(--lp-text)' }}>Marketplace.</h2>
                </div>
                <div style={{ width: '100px' }}></div> {/* Spacer */}
            </nav>

            {/* Content Area */}
            <div style={{ position: 'relative', zIndex: 10, maxWidth: '900px', margin: '0 auto', padding: '140px 20px 80px 20px' }}>

                {/* Main Content Card */}
                <div style={{ background: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.8)', padding: '60px', borderRadius: '32px', boxShadow: '0 20px 40px rgba(0,0,0,0.03)' }}>
                    <div style={{ marginBottom: '40px', borderBottom: '2px solid rgba(0,0,0,0.05)', paddingBottom: '30px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#ecfdf5', color: '#10b981', borderRadius: '99px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '20px' }}>
                            <FiShield /> Data & Privacy Protection
                        </div>
                        <h1 style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: '16px', color: 'var(--lp-text)' }}>Privacy Policy</h1>
                        <p style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: 500 }}>Last updated: March 3, 2026</p>
                    </div>

                    <div style={{ lineHeight: '1.9', color: '#334155', fontSize: '1.05rem', display: 'flex', flexDirection: 'column', gap: '40px' }}>
                        <p style={{ fontSize: '1.15rem', color: '#475569' }}>Welcome to Marketplace ("we," "our," or "us"). We are uncompromisingly committed to protecting your personal privacy. This Privacy Policy transparently explains exactly how your personal information is collected, actively used, and securely disclosed.</p>

                        <section>
                            <h2 style={{ color: 'var(--lp-text)', fontSize: '1.5rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '6px', height: '24px', background: '#3b82f6', borderRadius: '4px' }}></div>
                                1. Information We Collect
                            </h2>
                            <p><strong>Information you provide to us:</strong> When you register for a standard account, we securely collect your given name, campus email address, and departmental details. We explicitly do not track your location. We also naturally collect any information you freely choose to visibly provide in your profile configuration.</p>
                        </section>

                        <section>
                            <h2 style={{ color: 'var(--lp-text)', fontSize: '1.5rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '6px', height: '24px', background: '#10b981', borderRadius: '4px' }}></div>
                                2. How We Use Your Information
                            </h2>
                            <p>We leverage the sparse information we strictly collect purely to natively provide, maintain, and structurally improve our community services, to reliably communicate with you regarding your posts, and to aggressively protect our educational platform from identified fraud and automated abuse.</p>
                        </section>

                        <section>
                            <h2 style={{ color: 'var(--lp-text)', fontSize: '1.5rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '6px', height: '24px', background: '#f59e0b', borderRadius: '4px' }}></div>
                                3. Information Sharing
                            </h2>
                            <p><strong>We do not, and will never, sell your personal information to third parties.</strong> We may simply share anonymized telemetry with cloud service providers who exclusively perform hosting services for us, or explicitly in response to a direct, verified legal data request from authorized personnel.</p>
                        </section>

                        <section>
                            <h2 style={{ color: 'var(--lp-text)', fontSize: '1.5rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '6px', height: '24px', background: '#ef4444', borderRadius: '4px' }}></div>
                                4. Enterprise Security
                            </h2>
                            <p>We employ enterprise-grade, highly reasonable security measures leveraging cutting-edge encryption to help reliably protect information about you from sudden loss, theft, calculated misuse, and explicitly unauthorized access, hostile disclosure, sudden alteration, and digital destruction.</p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
