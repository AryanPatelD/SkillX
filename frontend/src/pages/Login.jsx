import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, AlertCircle, User, Lock, ArrowRight, BookOpen, Users, Zap, Award } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [roll_no, setRollNo] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = await login(email, roll_no, password);
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message);
            setLoading(false);
        }
    };

    const features = [
        { icon: BookOpen, label: 'Learn Skills', color: '#6366f1' },
        { icon: Users, label: 'Connect', color: '#8b5cf6' },
        { icon: Zap, label: 'Earn Credits', color: '#10b981' },
        { icon: Award, label: 'Get Certified', color: '#f59e0b' },
    ];

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'stretch', backgroundColor: '#f0f9ff' }}>
            {/* Left Side - Hero Section */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '2rem',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: 'white',
                minHeight: '100vh'
            }} className="hidden-on-mobile">
                <div style={{ maxWidth: '420px', textAlign: 'center', animation: 'fadeIn 0.8s ease-out' }}>
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
                        <BookOpen size={40} />
                    </div>
                    
                    <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1rem', lineHeight: 1.2 }}>
                        Welcome to SkillX
                    </h1>
                    
                    <p style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '3rem', fontWeight: 300 }}>
                        Share your expertise, learn new skills, and grow with the student community
                    </p>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '2.5rem' }}>
                        {features.map((feature, index) => (
                            <div key={index} style={{
                                background: 'rgba(255, 255, 255, 0.1)',
                                backdropFilter: 'blur(10px)',
                                padding: '1.5rem',
                                borderRadius: '1rem',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                transition: 'transform 0.3s ease',
                                animation: `slideUp 0.6s ease-out ${0.1 * index}s both`
                            }} 
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-8px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                <feature.icon size={28} style={{ marginBottom: '0.75rem' }} />
                                <p style={{ fontWeight: 600 }}>{feature.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                minHeight: '100vh'
            }}>
                <div style={{
                    width: '100%',
                    maxWidth: '420px',
                    animation: 'fadeIn 0.8s ease-out'
                }}>
                    <div style={{ marginBottom: '2.5rem' }}>
                        <div style={{
                            width: '60px',
                            height: '60px',
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '1.5rem',
                            boxShadow: '0 8px 16px -4px rgba(99, 102, 241, 0.4)'
                        }}>
                            <LogIn color="white" size={32} />
                        </div>
                        <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem' }}>Welcome Back</h2>
                        <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Sign in to continue your learning journey</p>
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

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        
                        <div>
                            <label style={{ fontWeight: '600', fontSize: '0.9rem', marginBottom: '0.5rem', display: 'block', color: '#1e293b' }}>
                                Email or Roll Number
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
                                    value={email || roll_no}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value.includes('@')) {
                                            setEmail(value);
                                            setRollNo('');
                                        } else if (value.length > 0 && !value.includes('@')) {
                                            setRollNo(value);
                                            setEmail('');
                                        } else {
                                            setEmail(value);
                                            setRollNo('');
                                        }
                                    }}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#6366f1';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#e2e8f0';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    required
                                    placeholder="e.g. 21CS001 or you@domain.com"
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
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onFocus={(e) => {
                                        e.target.style.borderColor = '#6366f1';
                                        e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                                    }}
                                    onBlur={(e) => {
                                        e.target.style.borderColor = '#e2e8f0';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                    required
                                    placeholder="Enter your password"
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

                        <button 
                            type="submit" 
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '0.95rem',
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
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
                                boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.4)',
                                opacity: loading ? 0.8 : 1
                            }}
                            onMouseEnter={(e) => !loading && (e.target.style.transform = 'translateY(-2px)', e.target.style.boxShadow = '0 6px 8px -1px rgba(99, 102, 241, 0.5)')}
                            onMouseLeave={(e) => (e.target.style.transform = 'translateY(0)', e.target.style.boxShadow = '0 4px 6px -1px rgba(99, 102, 241, 0.4)')}
                        >
                            {loading ? (
                                <>
                                    <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span>
                                    Signing in...
                                </>
                            ) : (
                                <>Sign In <ArrowRight size={18} /></>
                            )}
                        </button>
                    </form>

                    <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
                        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                            Don't have an account?{' '}
                            <Link to="/register" style={{ fontWeight: '700', color: '#6366f1', textDecoration: 'none', transition: 'color 0.2s ease' }} onMouseEnter={(e) => e.target.style.color = '#4f46e5'} onMouseLeave={(e) => e.target.style.color = '#6366f1'}>
                                Sign up
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

export default Login;
