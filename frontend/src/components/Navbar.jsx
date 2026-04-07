import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import QuizModal from './QuizModal';
import UpcomingMeetings from './UpcomingMeetings';
import {
    LayoutDashboard,
    Search,
    BookOpen,
    User,
    LogOut,
    Coins,
    ChevronLeft,
    ChevronRight,
    Menu,
    X
} from 'lucide-react';

const Sidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [quizModalOpen, setQuizModalOpen] = useState(false);

    useEffect(() => {
        document.body.setAttribute('data-sidebar', collapsed ? 'collapsed' : 'expanded');
        return () => document.body.removeAttribute('data-sidebar');
    }, [collapsed]);

    if (!user) return null;

    const handleLogout = () => {
        setShowLogoutModal(true);
        setMobileOpen(false);
    };

    const confirmLogout = () => {
        setShowLogoutModal(false);
        logout();
        navigate('/login');
    };

    const navItems = [
        { path: '/dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
        { path: '/skills-hub',  label: 'Skills Hub',  icon: Search },
        { path: '/my-sessions', label: 'My Sessions', icon: BookOpen },
        { path: '/profile',     label: 'Profile',     icon: User },
    ];

    const isActive = (path) => location.pathname === path;

    const SidebarContent = ({ isMobile = false }) => (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            padding: '1.25rem 0',
        }}>
            {/* Logo area — always clean, centered in both states */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 1.25rem',
                marginBottom: '2rem',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', minWidth: 0 }}>
                    <div style={{
                        width: '36px', height: '36px', flexShrink: 0,
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        borderRadius: '10px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontWeight: '800', fontSize: '1rem',
                        letterSpacing: '-0.5px',
                        boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
                    }}>SE</div>
                    {(!collapsed || isMobile) && (
                        <span style={{ fontWeight: '800', fontSize: '1.1rem', color: 'var(--text)', whiteSpace: 'nowrap' }}>
                            Skill<span style={{
                                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}>Exchange</span>
                        </span>
                    )}
                </div>
                {isMobile && (
                    <button onClick={() => setMobileOpen(false)} style={{
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        color: 'var(--text-muted)', padding: '4px',
                    }}>
                        <X size={20} />
                    </button>
                )}
            </div>

            {/* User Avatar Card */}
            <div style={{
                margin: '0 1rem 1.5rem',
                padding: collapsed && !isMobile ? '0.75rem 0' : '0.875rem 1rem',
                background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(139,92,246,0.05))',
                borderRadius: '12px',
                border: '1px solid rgba(99,102,241,0.15)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
            }}>
                <div style={{
                    width: '36px', height: '36px', flexShrink: 0,
                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: '700', fontSize: '1rem',
                    boxShadow: '0 4px 8px rgba(99,102,241,0.3)',
                }}>
                    {user?.full_name?.[0]?.toUpperCase()}
                </div>
                {(!collapsed || isMobile) && (
                    <div style={{ minWidth: 0 }}>
                        <p style={{ margin: 0, fontWeight: '700', fontSize: '0.875rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user?.full_name}
                        </p>
                        <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {user?.roll_no}
                        </p>
                    </div>
                )}
            </div>

            {/* Collapse toggle — right below avatar, desktop only */}
            {!isMobile && (
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        padding: collapsed ? '0.4rem 0.75rem' : '0.4rem 1.25rem',
                        margin: '0 1rem 1rem',
                        borderRadius: '8px',
                        background: 'transparent',
                        border: '1px solid var(--border)',
                        color: 'var(--text-muted)',
                        fontWeight: '500',
                        fontSize: '0.78rem',
                        cursor: 'pointer',
                        transition: 'all 0.18s ease',
                        width: 'calc(100% - 2rem)',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(99,102,241,0.06)';
                        e.currentTarget.style.borderColor = 'rgba(99,102,241,0.25)';
                        e.currentTarget.style.color = 'var(--primary)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.color = 'var(--text-muted)';
                    }}
                >
                    {collapsed
                        ? <ChevronRight size={14} style={{ flexShrink: 0 }} />
                        : <>
                            <ChevronLeft size={14} style={{ flexShrink: 0 }} />
                            <span>Collapse</span>
                          </>
                    }
                </button>
            )}

            {/* Nav Section Label */}
            {(!collapsed || isMobile) && (
                <p style={{
                    margin: '0 1.25rem 0.5rem',
                    fontSize: '0.68rem', fontWeight: '700',
                    color: 'var(--text-muted)', textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                }}>Navigation</p>
            )}

            {/* Nav Items */}
            <nav style={{ flex: 1, padding: '0 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {navItems.map((item) => {
                    const active = isActive(item.path);
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setMobileOpen(false)}
                            title={collapsed && !isMobile ? item.label : ''}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                padding: collapsed && !isMobile ? '0.75rem' : '0.75rem 1rem',
                                justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
                                borderRadius: '10px',
                                textDecoration: 'none',
                                fontWeight: active ? '700' : '500',
                                fontSize: '0.9rem',
                                color: active ? 'var(--primary)' : 'var(--text-muted)',
                                background: active
                                    ? 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))'
                                    : 'transparent',
                                border: active ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
                                transition: 'all 0.18s ease',
                                position: 'relative',
                            }}
                            onMouseEnter={e => {
                                if (!active) {
                                    e.currentTarget.style.background = 'rgba(99,102,241,0.06)';
                                    e.currentTarget.style.color = 'var(--text)';
                                }
                            }}
                            onMouseLeave={e => {
                                if (!active) {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.color = 'var(--text-muted)';
                                }
                            }}
                        >
                            {active && (
                                <div style={{
                                    position: 'absolute', left: 0, top: '20%', bottom: '20%',
                                    width: '3px', borderRadius: '0 3px 3px 0',
                                    background: 'var(--primary)',
                                }} />
                            )}
                            <item.icon size={18} style={{ flexShrink: 0 }} />
                            {(!collapsed || isMobile) && <span>{item.label}</span>}
                        </Link>
                    );
                })}
            </nav>

            {/* Upcoming Meetings Section */}
            <UpcomingMeetings collapsed={collapsed} isMobile={isMobile} />

            {/* Bottom Section */}
            <div style={{ padding: '0 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>

                {/* Credits */}
                <button
                    onClick={() => setQuizModalOpen(true)}
                    title={collapsed && !isMobile ? 'Take Quiz' : ''}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
                        padding: collapsed && !isMobile ? '0.75rem' : '0.75rem 1rem',
                        borderRadius: '10px',
                        background: user?.credits === 0 ? 'rgba(239,68,68,0.08)' : 'rgba(99,102,241,0.08)',
                        border: user?.credits === 0 ? '1px solid rgba(239,68,68,0.15)' : '1px solid rgba(99,102,241,0.15)',
                        color: user?.credits === 0 ? 'var(--error)' : 'var(--primary)',
                        fontWeight: '700',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        transition: 'all 0.18s ease',
                        width: '100%',
                    }}
                    onMouseEnter={(e) => {
                        e.target.style.opacity = '0.8';
                        e.target.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                        e.target.style.opacity = '1';
                        e.target.style.transform = 'translateY(0)';
                    }}
                >
                    <Coins size={18} style={{ flexShrink: 0 }} />
                    {(!collapsed || isMobile) && (
                        <span>
                            {user?.credits || 0} Credits
                            {user?.credits === 0 && ' - Quiz Available'}
                        </span>
                    )}
                </button>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    title={collapsed && !isMobile ? 'Logout' : ''}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        justifyContent: collapsed && !isMobile ? 'center' : 'flex-start',
                        padding: collapsed && !isMobile ? '0.75rem' : '0.75rem 1rem',
                        borderRadius: '10px',
                        background: 'rgba(239,68,68,0.06)',
                        border: '1px solid rgba(239,68,68,0.15)',
                        color: 'var(--error)',
                        fontWeight: '600',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        transition: 'all 0.18s ease',
                        width: '100%',
                    }}
                    onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(239,68,68,0.12)';
                        e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)';
                    }}
                    onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(239,68,68,0.06)';
                        e.currentTarget.style.borderColor = 'rgba(239,68,68,0.15)';
                    }}
                >
                    <LogOut size={18} style={{ flexShrink: 0 }} />
                    {(!collapsed || isMobile) && <span>Logout</span>}
                </button>
            </div>
        </div>
    );

    return (
        <>
            <style>{`
                @keyframes sidebarFadeIn { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: translateX(0); } }
                @keyframes overlayIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes modalSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes fadeInModal { from { opacity: 0; } to { opacity: 1; } }
                .sidebar-link-tooltip {
                    position: relative;
                }
            `}</style>

            {/* Mobile top bar */}
            <div className="mobile-topbar" style={{
                display: 'none',
                position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
                background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)',
                borderBottom: '1px solid var(--border)',
                padding: '0.75rem 1rem',
                alignItems: 'center', justifyContent: 'space-between',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{
                        width: '32px', height: '32px',
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        borderRadius: '8px', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', color: 'white', fontWeight: '800', fontSize: '0.85rem',
                    }}>SE</div>
                    <span style={{ fontWeight: '800', fontSize: '1rem', color: 'var(--text)' }}>
                        Skill<span className="text-gradient">Exchange</span>
                    </span>
                </div>
                <button onClick={() => setMobileOpen(true)} style={{
                    background: 'rgba(99,102,241,0.1)', border: 'none', borderRadius: '8px',
                    cursor: 'pointer', color: 'var(--primary)', padding: '0.5rem',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <Menu size={20} />
                </button>
            </div>

            {/* Desktop Sidebar */}
            <aside className="desktop-sidebar" style={{
                position: 'fixed', top: 0, left: 0, bottom: 0,
                width: collapsed ? '72px' : '240px',
                background: 'rgba(255,255,255,0.92)',
                backdropFilter: 'blur(16px)',
                borderRight: '1px solid rgba(99,102,241,0.12)',
                boxShadow: '4px 0 24px rgba(0,0,0,0.05)',
                transition: 'width 0.25s cubic-bezier(0.4,0,0.2,1)',
                zIndex: 150,
                overflow: 'hidden',
                animation: 'sidebarFadeIn 0.3s ease',
            }}>
                <SidebarContent />
            </aside>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div style={{
                    position: 'fixed', inset: 0, zIndex: 300,
                    display: 'flex', animation: 'overlayIn 0.2s ease',
                }}>
                    <div
                        onClick={() => setMobileOpen(false)}
                        style={{
                            position: 'absolute', inset: 0,
                            background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(3px)',
                        }}
                    />
                    <div style={{
                        position: 'relative', width: '260px', height: '100%',
                        background: 'rgba(255,255,255,0.97)',
                        boxShadow: '4px 0 32px rgba(0,0,0,0.15)',
                        animation: 'sidebarFadeIn 0.25s ease',
                    }}>
                        <SidebarContent isMobile />
                    </div>
                </div>
            )}

            {/* CSS for responsive */}
            <style>{`
                @media (max-width: 768px) {
                    .desktop-sidebar { display: none !important; }
                    .mobile-topbar { display: flex !important; }
                }
                @media (min-width: 769px) {
                    .mobile-topbar { display: none !important; }
                }
            `}</style>

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div style={{
                    position: 'fixed', inset: 0,
                    background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(5px)',
                    zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    animation: 'fadeInModal 0.2s ease',
                }}>
                    <div style={{
                        background: 'white', borderRadius: '1.25rem',
                        padding: '2rem', maxWidth: '360px', width: '90%',
                        textAlign: 'center', animation: 'modalSlideUp 0.25s ease',
                        boxShadow: '0 25px 50px rgba(0,0,0,0.18)',
                        border: '1px solid rgba(239,68,68,0.1)',
                    }}>
                        <div style={{
                            width: '60px', height: '60px', margin: '0 auto 1.25rem',
                            background: 'rgba(239,68,68,0.1)', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <LogOut size={28} color="var(--error)" />
                        </div>
                        <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.25rem', fontWeight: '800', color: 'var(--text)' }}>
                            Leaving so soon?
                        </h3>
                        <p style={{ margin: '0 0 1.75rem', color: 'var(--text-muted)', fontSize: '0.92rem', lineHeight: '1.5' }}>
                            Are you sure you want to log out of your account?
                        </p>
                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button
                                onClick={() => setShowLogoutModal(false)}
                                style={{
                                    flex: 1, padding: '0.7rem', borderRadius: '0.75rem',
                                    border: '1.5px solid var(--border)', background: 'transparent',
                                    color: 'var(--text)', fontWeight: '600', cursor: 'pointer',
                                    fontSize: '0.9rem', transition: 'all 0.18s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                                Stay
                            </button>
                            <button
                                onClick={confirmLogout}
                                style={{
                                    flex: 1, padding: '0.7rem', borderRadius: '0.75rem',
                                    border: 'none',
                                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                    color: 'white', fontWeight: '700', cursor: 'pointer',
                                    fontSize: '0.9rem',
                                    boxShadow: '0 4px 14px rgba(239,68,68,0.4)',
                                    transition: 'opacity 0.18s',
                                }}
                                onMouseEnter={e => e.currentTarget.style.opacity = '0.88'}
                                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                            >
                                Yes, Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Quiz Modal */}
            <QuizModal
                isOpen={quizModalOpen}
                onClose={() => setQuizModalOpen(false)}
                user={user}
                onQuizComplete={() => {
                    // Refresh user data after quiz completion
                }}
            />
        </>
    );
};

export default Sidebar;
