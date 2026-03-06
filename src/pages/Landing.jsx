import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiUsers, FiShoppingBag, FiMessageSquare, FiShield, FiStar, FiX, FiSend, FiCheckCircle, FiCode, FiHeart, FiInstagram, FiLinkedin } from 'react-icons/fi';
import { SiReact, SiFirebase, SiCloudflare } from 'react-icons/si';
import { createPost } from '../firebase/services';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './Landing.css';

gsap.registerPlugin(ScrollTrigger);

export default function Landing() {
    const [showConfessModal, setShowConfessModal] = useState(false);
    const [confessText, setConfessText] = useState('');
    const [posting, setPosting] = useState(false);
    const [error, setError] = useState('');

    const heroRef = useRef(null);
    const float1Ref = useRef(null);
    const float2Ref = useRef(null);
    const float3Ref = useRef(null);
    const featuresRef = useRef(null);
    const ctaRef = useRef(null);

    useEffect(() => {
        // Hero Anims
        const tl = gsap.timeline();
        tl.fromTo('.hero-badge', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' })
            .fromTo('.hero-text', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, '-=0.4')
            .fromTo('.hero-subtext', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, '-=0.6')
            .fromTo('.hero-btns', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }, '-=0.6');

        // Floating Element continuous animation
        gsap.to(float1Ref.current, { y: -20, rotation: 2, duration: 4, repeat: -1, yoyo: true, ease: 'sine.inOut' });
        gsap.to(float2Ref.current, { y: 20, rotation: -2, duration: 5, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 1 });

        // Scroll Animations for feature blocks
        const blocks = gsap.utils.toArray('.feature-layout');
        blocks.forEach((block) => {
            gsap.fromTo(block,
                { opacity: 0, y: 50 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: block,
                        start: 'top 80%',
                        toggleActions: 'play none none reverse'
                    }
                }
            );
        });

        // CTA Animation
        gsap.fromTo(ctaRef.current,
            { scale: 0.95, opacity: 0 },
            {
                scale: 1, opacity: 1, duration: 1, ease: 'power3.out',
                scrollTrigger: { trigger: ctaRef.current, start: 'top 85%' }
            }
        );

        return () => {
            ScrollTrigger.getAll().forEach(t => t.kill());
        };
    }, []);

    const handleConfess = async (e) => {
        e.preventDefault();
        if (!confessText.trim()) return;
        setPosting(true);
        setError('');
        try {
            await createPost({
                title: 'Anonymous Confession',
                content: confessText,
                tag: 'confession',
                type: 'text',
                authorId: 'anonymous_web',
                authorName: 'Anonymous',
                authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marketplace',
                communityId: 'all',
                communityName: 'Global',
                timeAgo: 'Just now'
            });
            setShowConfessModal(false);
            setConfessText('');
            alert("Confession dropped anonymously! Shh! 🤫");
        } catch (err) {
            setError(err.message);
        }
        setPosting(false);
    };

    return (
        <div className="landing-container">
            {/* Background geometry */}
            <div className="bg-shapes">
                <div className="shape shape-1"></div>
                <div className="shape shape-2"></div>
                <div className="shape shape-3"></div>
            </div>

            {/* Navigation */}
            <nav className="landing-nav">
                <div className="landing-logo">
                    <img src="/images/logo.png" alt="Marketplace Logo" className="landing-logo-img" />
                </div>
                <div className="landing-nav-links">
                    <a href="#features">Features</a>
                    <Link to="/marketplace">Marketplace</Link>
                </div>
                <div className="landing-auth-btns">
                    <Link to="/auth" state={{ mode: 'login' }} className="landing-btn-login">Log In</Link>
                    <Link to="/auth" state={{ mode: 'signup' }} className="landing-btn-join">Join Now</Link>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="section landing-hero" ref={heroRef}>
                <div className="floating-elements">
                    <div ref={float1Ref} className="floating-card" style={{ top: '20%', left: '10%' }}>
                        <div className="fc-icon" style={{ background: '#dbeafe', color: '#2563eb' }}><FiUsers /></div>
                        <div className="fc-text">
                            <h4>Active Community</h4>
                            <p>Create or join</p>
                        </div>
                    </div>
                    <div ref={float2Ref} className="floating-card" style={{ top: '60%', right: '15%' }}>
                        <div className="fc-icon" style={{ background: '#fce7f3', color: '#db2777' }}><FiShoppingBag /></div>
                        <div className="fc-text">
                            <h4>Marketplace</h4>
                            <p>Buy and sell</p>
                        </div>
                    </div>
                </div>

                <div className="hero-content">
                    <div className="hero-badge">FOR IGIT STUDENTS</div>
                    <h1 className="hero-text">Your Campus,<br /><span className="text-gradient">Online.</span></h1>
                    <p className="hero-subtext">Join the online platform for college students. Connect with communities and trade items at IGIT Sarang.</p>
                    <div className="hero-btns">
                        <Link to="/auth" state={{ mode: 'signup' }} className="btn-primary">Join Now <FiArrowRight /></Link>
                        <Link to="/auth" state={{ mode: 'guest' }} className="btn-secondary">Drop a Confession 🤫</Link>
                    </div>
                </div>
            </section>

            {/* Features (Image-Free Blocks) */}
            <section id="features" className="features-container" ref={featuresRef}>
                {/* Feature 1 */}
                <div className="feature-layout">
                    <div className="feature-text-block">
                        <h2>Suggest <span className="text-gradient">Features</span></h2>
                        <p>Help shape the future of the platform by suggesting new features.</p>
                        <div className="feature-list">
                            <div className="feature-list-item"><span className="check-icon"><FiCheckCircle /></span> Upvote ideas you like</div>
                            <div className="feature-list-item"><span className="check-icon"><FiCheckCircle /></span> Track progress of requests</div>
                            <div className="feature-list-item"><span className="check-icon"><FiCheckCircle /></span> Make anonymous suggestions</div>
                        </div>
                    </div>
                    <div className="feature-visual-block">
                        <div className="visual-abstract" style={{ transform: 'rotate(-2deg)' }}>
                            <div className="ui-header">
                                <div className="ui-avatar"></div>
                                <div className="ui-line"></div>
                            </div>
                            <div className="ui-body">
                                <div className="ui-bar" style={{ width: '80%' }}></div>
                                <div className="ui-bar" style={{ width: '60%' }}></div>
                                <div className="ui-bar" style={{ width: '90%' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Feature 2 */}
                <div className="feature-layout reverse">
                    <div className="feature-text-block">
                        <h2>Student <span className="text-gradient">Marketplace</span></h2>
                        <p>Buy and sell textbooks, electronics, and items with other students.</p>
                        <div className="feature-list">
                            <div className="feature-list-item"><span className="check-icon"><FiCheckCircle /></span> Verified students only</div>
                            <div className="feature-list-item"><span className="check-icon"><FiCheckCircle /></span> Safe messaging</div>
                            <div className="feature-list-item"><span className="check-icon"><FiCheckCircle /></span> Free to use</div>
                        </div>
                    </div>
                    <div className="feature-visual-block" style={{ background: 'linear-gradient(145deg, #fce7f3, #e2e8f0)' }}>
                        <div className="visual-abstract" style={{ transform: 'rotate(2deg)', width: '50%' }}>
                            <div style={{ height: '120px', background: '#fbcfe8', borderRadius: '12px', marginBottom: '12px' }}></div>
                            <div className="ui-bar" style={{ width: '70%', background: '#f472b6' }}></div>
                            <div className="ui-bar" style={{ width: '40%' }}></div>
                        </div>
                        <div className="visual-abstract" style={{ position: 'absolute', right: '10%', top: '20%', transform: 'rotate(-4deg)', width: '45%' }}>
                            <div style={{ height: '80px', background: '#e0e7ff', borderRadius: '12px', marginBottom: '12px' }}></div>
                            <div className="ui-bar" style={{ width: '90%', background: '#818cf8' }}></div>
                        </div>
                    </div>
                </div>
            </section>


            {/* CTA Section */}
            <section className="landing-cta">
                <div className="cta-box" ref={ctaRef}>
                    <h2>Ready to join?</h2>
                    <p>Get verified and join the community.</p>
                    <div className="cta-btns">
                        <Link to="/auth" state={{ mode: 'signup' }} className="btn-white">Create Account</Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-grid">
                    <div className="footer-brand">
                        <div className="landing-logo">
                            <h2 style={{ color: 'white', margin: 0, fontSize: '1.5rem', fontWeight: 900 }}>Marketplace.</h2>
                        </div>
                        <p>Empowering students to build meaningful connections across campus.</p>
                        <p className="motto">For IGITIANS</p>
                    </div>
                    <div>
                        <h4>Company</h4>
                        <Link to="/support">About</Link>
                        <Link to="/support">Careers</Link>
                        <Link to="/support">Press</Link>
                    </div>
                    <div>
                        <h4>Legal</h4>
                        <Link to="/privacy">Privacy</Link>
                        <Link to="/terms">Terms</Link>
                        <Link to="/support">Contact</Link>
                    </div>
                </div>

                {/* Developer card hidden for now */}
                {/* 
                <div style={{
                    margin: '60px auto 30px auto',
                    padding: '24px',
                    borderRadius: '24px',
                    background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.6) 0%, rgba(15, 23, 42, 0.9) 100%)',
                    backdropFilter: 'blur(16px)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
                    position: 'relative',
                    overflow: 'hidden',
                    color: 'white',
                    maxWidth: '480px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease'
                }} className="dev-card-premium">
                    <style>
                        {`
                            .dev-card-premium:hover {
                                transform: translateY(-4px);
                                box-shadow: 0 30px 60px -15px rgba(59, 130, 246, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.15);
                            }
                            .social-btn {
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                width: 40px;
                                height: 40px;
                                border-radius: 12px;
                                background: rgba(255, 255, 255, 0.05);
                                border: 1px solid rgba(255, 255, 255, 0.1);
                                color: #94a3b8;
                                transition: all 0.2s ease;
                                text-decoration: none;
                            }
                            .social-btn:hover {
                                background: rgba(255, 255, 255, 0.15);
                                color: white;
                                transform: scale(1.05);
                            }
                            .social-btn.insta:hover { color: #e1306c; border-color: rgba(225, 48, 108, 0.5); }
                            .social-btn.linkedin:hover { color: #0a66c2; border-color: rgba(10, 102, 194, 0.5); }
                            @keyframes pulseGlow {
                                0%, 100% { opacity: 0.3; transform: scale(1); }
                                50% { opacity: 0.6; transform: scale(1.2); }
                            }
                            @keyframes floatProfile {
                                0%, 100% { transform: translateY(0px); }
                                50% { transform: translateY(-8px); }
                            }
                            @keyframes spinSlow {
                                100% { transform: rotate(360deg); }
                            }
                        `}
                    </style>

                    <div style={{ position: 'absolute', top: '-50%', right: '-20%', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2) 0%, transparent 70%)', zIndex: 0 }}></div>

                    <div style={{ position: 'relative', zIndex: 1, animation: 'floatProfile 6s ease-in-out infinite' }}>
                        <div style={{ position: 'absolute', inset: '-6px', border: '1px dashed rgba(59, 130, 246, 0.4)', borderRadius: '50%', animation: 'spinSlow 20s linear infinite' }}></div>
                        <div style={{ position: 'absolute', inset: '-12px', border: '1px dotted rgba(139, 92, 246, 0.3)', borderRadius: '50%', animation: 'spinSlow 15s linear infinite reverse' }}></div>

                        <div style={{
                            flexShrink: 0,
                            width: '80px', height: '80px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 12px 24px rgba(99, 102, 241, 0.4)',
                            position: 'relative', zIndex: 2,
                            overflow: 'hidden',
                            border: '3px solid rgba(255, 255, 255, 0.1)'
                        }}>
                            <img src="/profile.jpg" alt="Priyankar Padhy" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.onerror = null; e.target.src = 'https://ui-avatars.com/api/?name=Priyankar+Padhy&background=0D8ABC&color=fff&size=128' }} />
                        </div>
                    </div>

                    <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                            <p style={{ margin: 0, fontSize: '0.7rem', color: '#60a5fa', textTransform: 'uppercase', letterSpacing: '1.5px', fontWeight: 800 }}>Lead Developer</p>
                            <span style={{ display: 'inline-block', width: '4px', height: '4px', borderRadius: '50%', background: '#64748b' }}></span>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>43rd Civil</p>
                        </div>
                        <h4 style={{ margin: '0 0 4px 0', fontSize: '1.25rem', color: '#f8fafc', fontWeight: 800, letterSpacing: '-0.3px' }}>Priyankar Padhy</h4>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                            Made with <FiHeart style={{ color: '#ef4444', fill: '#ef4444' }} /> for IGITIANS
                        </p>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '16px', background: 'rgba(0,0,0,0.25)', padding: '10px 16px', borderRadius: '100px', width: 'fit-content', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 800 }}>Powered By</span>
                            <div style={{ display: 'flex', gap: '14px', color: '#cbd5e1' }}>
                                <SiReact size={24} title="React.js" style={{ color: '#61dafb' }} />
                                <SiFirebase size={24} title="Firebase" style={{ color: '#ffca28' }} />
                                <SiCloudflare size={24} title="Cloudflare" style={{ color: '#f38020' }} />
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative', zIndex: 1 }}>
                        <a href="https://www.instagram.com/priyamnkar?igsh=MW82OHp5NzBxZXRmdA==" target="_blank" rel="noopener noreferrer" className="social-btn insta" title="Instagram">
                            <FiInstagram size={18} />
                        </a>
                        <a href="https://www.linkedin.com/in/priyankar-padhy-06aa3137a?utm_source=share_via&utm_content=profile&utm_medium=member_android" target="_blank" rel="noopener noreferrer" className="social-btn linkedin" title="LinkedIn">
                            <FiLinkedin size={18} />
                        </a>
                    </div>
                </div>
                */}

                <div className="footer-bottom">
                    <p>© 2026 Marketplace Inc. Constructed with ❤️</p>
                </div>
            </footer>

            {/* Anonymous Confession Modal for Unauthenticated Users */}
            {showConfessModal && (
                <div className="profile-modal-overlay" style={{ zIndex: 9999 }}>
                    <div className="profile-modal" style={{ maxWidth: '500px', padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Drop an Anonymous Confession</h2>
                            <button onClick={() => setShowConfessModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}><FiX /></button>
                        </div>

                        <div style={{ background: '#fef3c7', color: '#b45309', padding: '12px', borderRadius: '6px', marginBottom: '20px', fontSize: '0.9rem' }}>
                            <strong>Ultra-Private Mode:</strong> You don't need an account. We track absolutely NO data. Your total privacy is guaranteed.
                        </div>

                        {error && <div style={{ background: '#fee2e2', color: '#dc2626', padding: '10px', borderRadius: '6px', marginBottom: '15px' }}>{error}</div>}

                        <form onSubmit={handleConfess}>
                            <textarea
                                placeholder="Spill the tea... what's on your mind?"
                                style={{ width: '100%', minHeight: '150px', padding: '15px', borderRadius: '12px', border: '2px solid var(--border-light)', fontSize: '1rem', resize: 'vertical' }}
                                value={confessText}
                                onChange={(e) => setConfessText(e.target.value)}
                            />

                            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', gap: '15px' }}>
                                <button type="button" onClick={() => setShowConfessModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" disabled={posting || !confessText.trim()} style={{ background: '#8b5cf6', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    {posting ? 'Sending...' : <><FiSend /> Post Confession</>}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
