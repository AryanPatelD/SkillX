import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, AlertCircle, Mail, Lock, User, Hash, FileText, ArrowRight, CheckCircle, Sparkles } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        full_name: '',
        roll_no: '',
        bio: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = await register(formData);
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message);
            setLoading(false);
        }
    };

    const benefits = [
        { icon: CheckCircle, text: 'Share your skills' },
        { icon: Sparkles, text: 'Learn new skills' },
        { icon: CheckCircle, text: 'Earn credits' },
    ];

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'stretch', backgroundColor: '#f0f9ff' }}>
            {/* Left Side - Features Section */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '2rem',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
                color: 'white',
                minHeight: '100vh'
            }} className="hidden-on-mobile">
                <div style={{ maxWidth: '420px', animation: 'fadeIn 0.8s ease-out' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        background: 'rgba(255, 255, 255, 0.2)',
                        borderRadius: '20px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 2rem',
                        backdropFilter: 'blur(10px)'
                    }}>
                        <UserPlus size={40} />
                    </div>
                    
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem', lineHeight: 1.2 }}>
                        Join SkillX
                    </h1>
                    
                    <p style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '2.5rem', fontWeight: 300 }}>
                        Connect with peers, share expertise, and grow together
                    </p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        {benefits.map((benefit, index) => (
                            <div key={index} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '1rem',
                                opacity: 0.9,
                                animation: `slideUp 0.6s ease-out ${0.1 * index}s both`
                            }}>
                                <benefit.icon size={24} />
                                <span style={{ fontSize: '1rem', fontWeight: 500 }}>{benefit.text}</span>
                            </div>
                        ))}
                    </div>

                    <div style={{
                        marginTop: '3rem',
                        padding: '1.5rem',
                        background: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '1rem',
                        border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}>
                        <p style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.75rem' }}>✨ Fresh start:</p>
                        <p style={{ fontSize: '0.85rem', opacity: 0.85 }}>Get 10 free credits to book your first learning session!</p>
                    </div>
                </div>
            </div>

            {/* Right Side - Registration Form */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                minHeight: '100vh',
                overflowY: 'auto'
            }}>
                <div style={{
                    width: '100%',
                    maxWidth: '480px',
                    animation: 'fadeIn 0.8s ease-out'
                }}>
                    <div style={{ marginBottom: '2rem' }}>
                        <div style={{
                            width: '60px',
                            height: '60px',
                            background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '1.5rem',
                            boxShadow: '0 8px 16px -4px rgba(139, 92, 246, 0.4)'
                        }}>
                            <UserPlus color="white" size={32} />
                        </div>
                        <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem' }}>Create Account</h2>
                        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Join the student community and start learning</p>
                    </div>

                    {error && (
                        <div style={{
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            borderRadius: '0.75rem',
                            padding: '1rem',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            gap: '0.75rem',
                            animation: 'slideDown 0.3s ease-out'
                        }}>
                            <AlertCircle size={20} style={{ color: '#dc2626', flexShrink: 0, marginTop: '2px' }} />
                            <span style={{ color: '#dc2626', fontSize: '0.9rem' }}>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                        
                        <div>
                            <label style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block', color: '#1e293b' }}>
                                Full Name
                            </label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: '#64748b', display: 'flex' }}>
                                    <User size={18} />
                                </div>
                                <input
                                    type="text"
                                    style={{
                                        width: '100%',
                                        padding: '0.875rem 1rem 0.875rem 2.75rem',
                                        borderRadius: '0.75rem',
                                        border: '2px solid #e2e8f0',
                                        background: '#ffffff',
                                        fontSize: '1rem',
                                        fontFamily: 'inherit',
                                        transition: 'all 0.2s ease',
                                        outline: 'none'
                                    }}
                                    name="full_name"
                                    value={formData.full_name}
                                    onChange={handleChange}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#8b5cf6';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#e2e8f0';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    required
                                    placeholder="Jane Doe"
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block', color: '#1e293b' }}>
                                Email Address
                            </label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: '#64748b', display: 'flex' }}>
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    style={{
                                        width: '100%',
                                        padding: '0.875rem 1rem 0.875rem 2.75rem',
                                        borderRadius: '0.75rem',
                                        border: '2px solid #e2e8f0',
                                        background: '#ffffff',
                                        fontSize: '1rem',
                                        fontFamily: 'inherit',
                                        transition: 'all 0.2s ease',
                                        outline: 'none'
                                    }}
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#8b5cf6';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#e2e8f0';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    required
                                    placeholder="jane@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block', color: '#1e293b' }}>
                                Roll Number
                            </label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: '#64748b', display: 'flex' }}>
                                    <Hash size={18} />
                                </div>
                                <input
                                    type="text"
                                    style={{
                                        width: '100%',
                                        padding: '0.875rem 1rem 0.875rem 2.75rem',
                                        borderRadius: '0.75rem',
                                        border: '2px solid #e2e8f0',
                                        background: '#ffffff',
                                        fontSize: '1rem',
                                        fontFamily: 'inherit',
                                        transition: 'all 0.2s ease',
                                        outline: 'none'
                                    }}
                                    name="roll_no"
                                    value={formData.roll_no}
                                    onChange={handleChange}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#8b5cf6';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#e2e8f0';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    required
                                    placeholder="23CS001"
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block', color: '#1e293b' }}>
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '50%', left: '1rem', transform: 'translateY(-50%)', color: '#64748b', display: 'flex' }}>
                                    <Lock size={18} />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    style={{
                                        width: '100%',
                                        padding: '0.875rem 2.75rem 0.875rem 2.75rem',
                                        borderRadius: '0.75rem',
                                        border: '2px solid #e2e8f0',
                                        background: '#ffffff',
                                        fontSize: '1rem',
                                        fontFamily: 'inherit',
                                        transition: 'all 0.2s ease',
                                        outline: 'none'
                                    }}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#8b5cf6';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#e2e8f0';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    required
                                    placeholder="Create a password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '1rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        color: '#64748b',
                                        cursor: 'pointer',
                                        padding: '0.5rem',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    {showPassword ? '🙈' : '👁️'}
                                </button>
                            </div>
                        </div>

                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block', color: '#1e293b' }}>
                                Bio (Optional)
                            </label>
                            <div style={{ position: 'relative' }}>
                                <div style={{ position: 'absolute', top: '15px', left: '1rem', color: '#64748b', display: 'flex' }}>
                                    <FileText size={18} />
                                </div>
                                <textarea
                                    style={{
                                        width: '100%',
                                        padding: '0.875rem 1rem 0.875rem 2.75rem',
                                        borderRadius: '0.75rem',
                                        border: '2px solid #e2e8f0',
                                        background: '#ffffff',
                                        fontSize: '1rem',
                                        fontFamily: 'inherit',
                                        transition: 'all 0.2s ease',
                                        outline: 'none',
                                        resize: 'vertical',
                                        minHeight: '100px',
                                        lineHeight: '1.5'
                                    }}
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#8b5cf6';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#e2e8f0';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    placeholder="What skills do you have? What do you want to learn?"
                                    rows="3"
                                />
                            </div>
                        </div>

                        <div style={{ gridColumn: '1 / -1', marginTop: '0.5rem' }}>
                            <button 
                                type="submit" 
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: '0.95rem',
                                    background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '0.75rem',
                                    fontWeight: '700',
                                    fontSize: '1rem',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    boxShadow: '0 4px 6px -1px rgba(139, 92, 246, 0.4)',
                                    opacity: loading ? 0.8 : 1
                                }}
                                onMouseEnter={(e) => !loading && (e.target.style.transform = 'translateY(-2px)', e.target.style.boxShadow = '0 6px 8px -1px rgba(139, 92, 246, 0.5)')}
                                onMouseLeave={(e) => (e.target.style.transform = 'translateY(0)', e.target.style.boxShadow = '0 4px 6px -1px rgba(139, 92, 246, 0.4)')}
                            >
                                {loading ? (
                                    <>
                                        <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span>
                                        Creating Account...
                                    </>
                                ) : (
                                    <>Sign Up <ArrowRight size={18} /></>
                                )}
                            </button>
                        </div>
                    </form>

                    <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
                        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                            Already have an account?{' '}
                            <Link to="/login" style={{ fontWeight: '700', color: '#8b5cf6', textDecoration: 'none', transition: 'color 0.2s ease' }} onMouseEnter={(e) => e.target.style.color = '#7c3aed'} onMouseLeave={(e) => e.target.style.color = '#8b5cf6'}>
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideUp {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slideDown {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                @media (max-width: 768px) {
                    .hidden-on-mobile { display: none !important; }
                }
            `}</style>
        </div>
    );
};

export default Register;
