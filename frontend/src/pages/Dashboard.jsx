import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, User } from 'lucide-react';

const Dashboard = () => {
    const { user, logout } = useAuth();

    return (

        <div className="animate-fade-in" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
                    Welcome back, <span className="text-gradient">{user?.full_name?.split(' ')[0]}</span>!
                </h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Here's what's happening with your skill exchange.</p>
            </div>

            <div className="grid-layout">
                {/* Profile Summary Card */}
                <div className="card glass-panel" style={{ gridRow: 'span 2' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '1.5rem' }}>
                        <div style={{
                            width: '100px',
                            height: '100px',
                            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '2.5rem',
                            color: 'white',
                            fontWeight: 'bold',
                            marginBottom: '1rem',
                            boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.3)'
                        }}>
                            {user?.full_name?.[0]?.toUpperCase()}
                        </div>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{user?.full_name}</h2>
                        <p style={{ color: 'var(--text-muted)' }}>Roll: {user?.roll_no}</p>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '700' }}>Bio</h3>
                        <p style={{ lineHeight: '1.6' }}>{user?.bio || 'No bio added yet. Edit your profile to add one!'}</p>
                    </div>

                    <a href="/profile" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center' }}>
                        View Profile
                    </a>
                </div>

                {/* Quick Stats / Actions */}
                <div className="card" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: 'white' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'white' }}>Ready to learn?</h3>
                    <p style={{ marginBottom: '1.5rem', opacity: '0.9' }}>Find a tutor or request help for a specific skill.</p>
                    <a href="/skills-hub" className="btn" style={{ background: 'white', color: 'var(--primary)', border: 'none' }}>
                        Explore Skills Hub
                    </a>
                </div>

                <div className="card" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', color: 'white' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: 'white' }}>Share your knowledge</h3>
                    <p style={{ marginBottom: '1.5rem', opacity: '0.9' }}>Offer your skills to help others and earn teaching experience.</p>
                    <a href="/offer-skill" className="btn" style={{ background: 'white', color: '#059669', border: 'none' }}>
                        Offer a Skill
                    </a>
                </div>

                {/* Recent Activity Placeholder */}
                <div className="card" style={{ gridColumn: 'span 2' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Recent Activity</h3>
                    <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)', background: '#f8fafc', borderRadius: 'var(--radius)', border: '2px dashed var(--border)' }}>
                        <p>No recent activity to show.</p>
                    </div>
                </div>
            </div>
        </div>
    );

};

export default Dashboard;
