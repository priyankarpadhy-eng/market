import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiMail, FiMessageCircle, FiHelpCircle, FiChevronDown, FiChevronUp, FiShield, FiUsers, FiAlertTriangle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

export default function Support() {
    const navigate = useNavigate();
    const [openFaq, setOpenFaq] = useState(null);

    const faqs = [
        {
            q: "How do I verify my campus status?",
            a: "You can verify your status by using your college email address during signup. We will send a verification link to that email to confirm your identity.",
            icon: <FiShield />
        },
        {
            q: "Is the platform free to use?",
            a: "Yes, our platform is completely free for students. We do not charge any fees for posting, messaging, or using the marketplace.",
            icon: <FiUsers />
        },
        {
            q: "How do I report inappropriate content?",
            a: "You can report any post by clicking the three dots (⋯) icon on the post and selecting a reason. Our moderators will review it within 24 hours.",
            icon: <FiAlertTriangle />
        },
        {
            q: "Can I post anonymously?",
            a: "Yes! When creating a 'Confession' tagged post, your identity is completely hidden. You can also post as a guest without logging in — these will always be anonymous confessions.",
            icon: <FiHelpCircle />
        },
        {
            q: "How long do posts stay active?",
            a: "Posts auto-delete after 7 days unless they receive 50+ likes, which makes them 'Immortal' and they stay forever.",
            icon: <FiHelpCircle />
        }
    ];

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc, #eef2ff, #f8fafc)', fontFamily: "'Inter', sans-serif" }}>
            {/* Header */}
            <div style={{ background: 'white', borderBottom: '1px solid #e2e8f0', padding: '16px 5%', position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(10px)' }}>
                <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate(-1)}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '6px',
                            padding: '10px 18px', borderRadius: '10px',
                            border: '1px solid #e2e8f0', background: 'white',
                            fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer',
                            color: '#334155'
                        }}
                    >
                        <FiArrowLeft /> Back
                    </motion.button>
                    <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Support & Help Center</h1>
                </div>
            </div>

            <div style={{ maxWidth: '900px', margin: '0 auto', padding: '40px 20px 80px' }}>
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ textAlign: 'center', marginBottom: '48px' }}
                >
                    <div style={{ fontSize: '3.5rem', marginBottom: '16px' }}>🛟</div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', marginBottom: '12px' }}>How can we help you?</h2>
                    <p style={{ color: '#64748b', fontSize: '1rem', maxWidth: '500px', margin: '0 auto', lineHeight: 1.6 }}>
                        Got a question or running into an issue? Check out the FAQ below or reach out to us directly.
                    </p>
                </motion.div>

                {/* Contact Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '48px' }}>
                    <motion.a
                        href="mailto:clawcode66@gmail.com"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(79,70,229,0.12)' }}
                        style={{
                            background: 'white', padding: '32px', borderRadius: '20px',
                            border: '1px solid #e2e8f0', textDecoration: 'none',
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            gap: '16px', textAlign: 'center', cursor: 'pointer',
                            transition: 'box-shadow 0.3s'
                        }}
                    >
                        <div style={{
                            width: '64px', height: '64px', borderRadius: '16px',
                            background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontSize: '1.5rem'
                        }}>
                            <FiMail />
                        </div>
                        <div>
                            <h3 style={{ margin: '0 0 6px', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Email Us</h3>
                            <p style={{ margin: '0 0 12px', color: '#64748b', fontSize: '0.88rem' }}>For general inquiries and support</p>
                            <span style={{ color: '#4f46e5', fontWeight: 700, fontSize: '1rem' }}>clawcode66@gmail.com</span>
                        </div>
                    </motion.a>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(16,185,129,0.12)' }}
                        style={{
                            background: 'white', padding: '32px', borderRadius: '20px',
                            border: '1px solid #e2e8f0',
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            gap: '16px', textAlign: 'center',
                            transition: 'box-shadow 0.3s'
                        }}
                    >
                        <div style={{
                            width: '64px', height: '64px', borderRadius: '16px',
                            background: 'linear-gradient(135deg, #10b981, #059669)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontSize: '1.5rem'
                        }}>
                            <FiMessageCircle />
                        </div>
                        <div>
                            <h3 style={{ margin: '0 0 6px', fontSize: '1.1rem', fontWeight: 700, color: '#0f172a' }}>Response Time</h3>
                            <p style={{ margin: '0 0 12px', color: '#64748b', fontSize: '0.88rem' }}>We typically respond within</p>
                            <span style={{ color: '#10b981', fontWeight: 700, fontSize: '1rem' }}>24 hours</span>
                        </div>
                    </motion.div>
                </div>

                {/* FAQ Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px', textAlign: 'center' }}>Frequently Asked Questions</h2>
                    <p style={{ color: '#94a3b8', textAlign: 'center', marginBottom: '28px', fontSize: '0.9rem' }}>Click a question to expand the answer</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {faqs.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.35 + i * 0.05 }}
                                style={{
                                    background: 'white', border: '1px solid #e2e8f0',
                                    borderRadius: '16px', overflow: 'hidden',
                                    transition: 'box-shadow 0.2s',
                                    boxShadow: openFaq === i ? '0 4px 16px rgba(0,0,0,0.06)' : 'none'
                                }}
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    style={{
                                        width: '100%', display: 'flex', alignItems: 'center', gap: '14px',
                                        padding: '20px 24px', background: 'none', border: 'none',
                                        cursor: 'pointer', textAlign: 'left'
                                    }}
                                >
                                    <span style={{
                                        width: '38px', height: '38px', borderRadius: '10px',
                                        background: openFaq === i ? '#4f46e5' : '#f1f5f9',
                                        color: openFaq === i ? 'white' : '#64748b',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: '1rem', flexShrink: 0, transition: 'all 0.2s'
                                    }}>
                                        {item.icon}
                                    </span>
                                    <span style={{ flex: 1, fontWeight: 700, fontSize: '0.95rem', color: '#0f172a' }}>{item.q}</span>
                                    {openFaq === i ? <FiChevronUp color="#4f46e5" /> : <FiChevronDown color="#94a3b8" />}
                                </button>
                                <AnimatePresence>
                                    {openFaq === i && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.2 }}
                                            style={{ overflow: 'hidden' }}
                                        >
                                            <p style={{ padding: '0 24px 20px 76px', margin: 0, color: '#475569', fontSize: '0.9rem', lineHeight: 1.7 }}>
                                                {item.a}
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Bottom CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    style={{
                        marginTop: '48px', padding: '32px', borderRadius: '20px',
                        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                        textAlign: 'center', color: 'white'
                    }}
                >
                    <h3 style={{ margin: '0 0 8px', fontSize: '1.2rem', fontWeight: 700 }}>Still have questions?</h3>
                    <p style={{ margin: '0 0 20px', opacity: 0.85, fontSize: '0.9rem' }}>Don't hesitate to reach out. We're here to help!</p>
                    <a
                        href="mailto:clawcode66@gmail.com"
                        style={{
                            display: 'inline-flex', alignItems: 'center', gap: '8px',
                            padding: '12px 28px', background: 'white', color: '#4f46e5',
                            borderRadius: '12px', fontWeight: 700, textDecoration: 'none',
                            fontSize: '0.95rem'
                        }}
                    >
                        <FiMail /> Send us an Email
                    </a>
                </motion.div>
            </div>
        </div>
    );
}
