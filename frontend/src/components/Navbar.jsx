import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Search,
    BookOpen,
    User,
    LogOut,
    Menu,
    X,
    PlusCircle,
    HelpCircle,
    Coins
} from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    if (!user) return null;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/skills-hub', label: 'Skills Hub', icon: Search },
        { path: '/my-sessions', label: 'My Sessions', icon: BookOpen },
        { path: '/profile', label: 'Profile', icon: User },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="glass-panel" style={{
            position: 'sticky',
            top: '1rem',
            zIndex: 100,
            margin: '0 1rem',
            padding: '0.75rem 1.5rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                    width: '40px',
                    height: '40px',
                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '1.25rem'
                }}>
                    SE
                </div>
                <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text)' }}>
                    Skill<span className="text-gradient">Exchange</span>
                </span>
            </div>

            {/* Desktop Navigation */}
            <div className="desktop-nav" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                {navItems.map((item) => (
                    <Link
                        key={item.path}
                        to={item.path}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            textDecoration: 'none',
                            color: isActive(item.path) ? 'var(--primary)' : 'var(--text-muted)',
                            fontWeight: isActive(item.path) ? '600' : '500',
                            transition: 'color 0.2s'
                        }}
                    >
                        <item.icon size={18} />
                        {item.label}
                    </Link>
                ))}

                <div style={{ width: '1px', height: '24px', background: 'var(--border)' }}></div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    background: 'rgba(147, 112, 219, 0.1)',
                    padding: '0.5rem 1rem',
                    borderRadius: '0.5rem',
                    color: 'var(--primary)',
                    fontWeight: '600'
                }}>
                    <Coins size={18} />
                    {user?.credits || 0} Credits
                </div>

                <button
                    onClick={handleLogout}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--error)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontWeight: '600'
                    }}
                >
                    <LogOut size={18} />
                    Logout
                </button>
            </div>

            {/* Mobile Menu Button - Hidden on Desktop implies media queries which we can't do inline easily, 
                so we'll rely on the parent container width or just keep it simple for now. 
                For a real "responsive" feel without media queries in CSS files, we might need window listener, 
                but let's assume valid CSS handling or just show/hide based on screen size if we had CSS modules. 
                Here we will just leave it as is for simplicity or add a style tag.
            */}
            <style>{`
                @media (max-width: 768px) {
                    .desktop-nav { display: none !important; }
                    .mobile-menu-btn { display: block !important; }
                }
                @media (min-width: 769px) {
                    .mobile-menu-btn { display: none !important; }
                }
            `}</style>

            <button
                className="mobile-menu-btn"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text)' }}
            >
                {isMenuOpen ? <X /> : <Menu />}
            </button>

            {/* Mobile Dropdown */}
            {isMenuOpen && (
                <div className="glass-panel" style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '1rem',
                    padding: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                }}>
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setIsMenuOpen(false)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                textDecoration: 'none',
                                color: isActive(item.path) ? 'var(--primary)' : 'var(--text)',
                                padding: '0.75rem',
                                borderRadius: 'var(--radius-sm)',
                                background: isActive(item.path) ? '#e0e7ff' : 'transparent'
                            }}
                        >
                            <item.icon size={20} />
                            {item.label}
                        </Link>
                    ))}
                    <div style={{ height: '1px', background: 'var(--border)' }}></div>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        background: 'rgba(147, 112, 219, 0.1)',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        color: 'var(--primary)',
                        fontWeight: '600'
                    }}>
                        <Coins size={20} />
                        {user?.credits || 0} Credits
                    </div>
                    <button
                        onClick={handleLogout}
                        style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--error)',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.75rem',
                            width: '100%',
                            textAlign: 'left',
                            fontWeight: '600'
                        }}
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
