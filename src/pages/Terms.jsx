import { Link } from 'react-router-dom';
import { FiArrowLeft, FiFileText } from 'react-icons/fi';
import './Landing.css';

export default function Terms() {
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
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 16px', background: '#e0e7ff', color: '#4f46e5', borderRadius: '99px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '20px' }}>
                            <FiFileText /> Legal Document
                        </div>
                        <h1 style={{ fontSize: '3.5rem', fontWeight: 900, letterSpacing: '-1.5px', marginBottom: '16px', color: 'var(--lp-text)' }}>Terms & Conditions</h1>
                        <p style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: 500 }}>Last updated: March 3, 2026</p>
                    </div>

                    <div style={{ lineHeight: '1.9', color: '#334155', fontSize: '1.05rem', display: 'flex', flexDirection: 'column', gap: '40px' }}>
                        <p style={{ fontSize: '1.15rem', color: '#475569' }}>By using the Marketplace application, you explicitly agree to comply with and be bound by the following terms and conditions. Please read these terms carefully before accessing the platform.</p>

                        <section>
                            <h2 style={{ color: 'var(--lp-text)', fontSize: '1.5rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '6px', height: '24px', background: '#3b82f6', borderRadius: '4px' }}></div>
                                1. Use of Service
                            </h2>
                            <p>You must be a verified student of an educational institution to use this service. Guest accounts are explicitly provided for anonymous confessions but hold strictly limited messaging privileges. You are unconditionally responsible for maintaining the strict confidentiality of your account credentials.</p>
                        </section>

                        <section>
                            <h2 style={{ color: 'var(--lp-text)', fontSize: '1.5rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '6px', height: '24px', background: '#10b981', borderRadius: '4px' }}></div>
                                2. Marketplace Transactions
                            </h2>
                            <p>Marketplace acts <strong>exclusively</strong> as an introductory community platform for students to connect. We do not process, oversee, or handle the actual exchange of physical money, deposits, or items. You are fully responsible for your own physical safety and financial security when meeting peers for exchanges from the marketplace.</p>
                        </section>

                        <section>
                            <h2 style={{ color: 'var(--lp-text)', fontSize: '1.5rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '6px', height: '24px', background: '#f59e0b', borderRadius: '4px' }}></div>
                                3. Prohibited Content & Speech Guidelines
                            </h2>
                            <p>You may not post content that is illegal, highly offensive, harassing, explicit, or inherently violates the active rights of others. We reserve the unequivocal, unchallengeable right to permanently remove any content or instantly suspend accounts that violate our community standards without giving any prior notice.</p>

                            <div style={{ marginTop: '24px', padding: '20px', background: 'rgba(245, 158, 11, 0.05)', borderLeft: '4px solid #f59e0b', borderRadius: '0 8px 8px 0' }}>
                                <h3 style={{ color: '#b45309', fontSize: '1.2rem', marginBottom: '12px', fontWeight: 700 }}>Constitutional Context on Open Platforms</h3>

                                <h4 style={{ color: '#92400e', fontSize: '1.05rem', marginTop: '16px', marginBottom: '8px', fontWeight: 700 }}>Article 19(1)(a): The Right to Freedom of Speech</h4>
                                <p style={{ fontSize: '0.95rem', color: '#451a03', marginBottom: '16px', lineHeight: '1.6' }}>This article guarantees all citizens the right to freedom of speech and expression. This includes the right to express your opinions through words, writing, printing, or any other medium (including social media within this platform).</p>

                                <h4 style={{ color: '#92400e', fontSize: '1.05rem', marginTop: '16px', marginBottom: '8px', fontWeight: 700 }}>Article 19(2): "Reasonable Restrictions"</h4>
                                <p style={{ fontSize: '0.95rem', color: '#451a03', marginBottom: '12px', lineHeight: '1.6' }}>Freedom of speech is not absolute. The platform will enforce restrictions reflecting government standards on several grounds, including:</p>

                                <ul style={{ fontSize: '0.95rem', color: '#451a03', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <li><strong>Defamation:</strong> You cannot use your speech to damage the reputation of another person. If you "say bad things" that are false and harm someone's character, it can lead to civil or criminal defamation cases.</li>
                                    <li><strong>Decency or Morality:</strong> This covers the use of "bad language" or "obscenity." Publicly using foul or indecent language can be restricted under this clause.</li>
                                    <li><strong>Public Order:</strong> Speech that incites people to violence or creates chaos is strictly prohibited.</li>
                                    <li><strong>Sovereignty and Integrity of India:</strong> Speech that threatens the security of the country is absolutely restricted.</li>
                                </ul>
                            </div>
                        </section>

                        <section>
                            <h2 style={{ color: 'var(--lp-text)', fontSize: '1.5rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '6px', height: '24px', background: '#ef4444', borderRadius: '4px' }}></div>
                                4. Limitation of Liability
                            </h2>
                            <p>Marketplace and its active creators shall not be held liable for any indirect, incidental, severe, or absolute consequential damages definitively resulting from the use of our services, including but not limited to lost profits, targeted data loss, or physical harm directly resulting from user-coordinated meetups.</p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
