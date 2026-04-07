import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Save, Edit2, Coins } from 'lucide-react';
import RatingDisplay from '../components/RatingDisplay';
import UserFeedback from '../components/UserFeedback';

const Profile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({ full_name: '', bio: '' });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setError(null);
            const response = await api.get('/profile');
            // Also fetch public profile to get ratings
            const publicResponse = await api.get(`/profile/public/${response.data.id}`);
            setProfile(publicResponse.data);
            setFormData({
                full_name: publicResponse.data.full_name,
                bio: publicResponse.data.bio || ''
            });
        } catch (error) {
            console.error('Error fetching profile:', error);
            setError(error.response?.data?.message || 'Failed to load profile. Please try again.');
            setProfile(null);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.put('/profile', formData);
            setProfile(response.data.user);
            setIsEditing(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            setError(error.response?.data?.message || 'Failed to update profile. Please try again.');
        }
    };

    if (loading) return <div>Loading...</div>;
    
    if (error) {
        return (
            <div style={{ padding: 'clamp(0.75rem, 3%, 1.25rem)', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
                <div style={{ 
                    background: 'rgba(239, 68, 68, 0.1)', 
                    border: '1px solid rgba(239, 68, 68, 0.5)',
                    borderRadius: '8px',
                    padding: '1rem',
                    color: '#dc2626',
                    marginBottom: '1rem'
                }}>
                    <p style={{ margin: 0, marginBottom: '0.5rem', fontWeight: 'bold' }}>Error</p>
                    <p style={{ margin: 0, marginBottom: '1rem' }}>{error}</p>
                    <button 
                        onClick={fetchProfile}
                        style={{
                            background: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '0.5rem 1rem',
                            cursor: 'pointer'
                        }}
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }
    
    if (!profile) {
        return (
            <div style={{ padding: 'clamp(0.75rem, 3%, 1.25rem)', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
                <div style={{ 
                    background: 'rgba(239, 68, 68, 0.1)', 
                    border: '1px solid rgba(239, 68, 68, 0.5)',
                    borderRadius: '8px',
                    padding: '1rem',
                    color: '#dc2626'
                }}>
                    <p style={{ margin: 0, marginBottom: '1rem' }}>Unable to load profile data.</p>
                    <button 
                        onClick={fetchProfile}
                        style={{
                            background: '#dc2626',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '0.5rem 1rem',
                            cursor: 'pointer'
                        }}
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const containerStyle = {
        padding: 'clamp(0.75rem, 3%, 1.25rem)',
        maxWidth: '900px',
        margin: '0 auto',
        width: '100%',
        boxSizing: 'border-box',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column'
    };

    const headerStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '2rem',
        '@media (min-width: 768px)': {
            flexDirection: 'row',
            alignItems: 'center'
        }
    };

    return (
        <div className="animate-fade-in" style={containerStyle}>
            <style>{`
                .profile-card {
                    flex: 1;
                    overflow-y: auto;
                    max-height: calc(100vh - 80px);
                }
                @media (max-width: 767px) {
                    .profile-card {
                        max-height: calc(100vh - 60px);
                    }
                    .profile-header {
                        flex-direction: column !important;
                        align-items: flex-start !important;
                        margin-bottom: 1rem !important;
                        gap: 0.75rem !important;
                    }
                    .profile-edit-btn {
                        width: 100%;
                    }
                    .profile-user-card {
                        flex-direction: column !important;
                        align-items: center !important;
                        text-align: center !important;
                        padding: 0.875rem !important;
                        gap: 0.75rem !important;
                    }
                    .profile-avatar {
                        margin-bottom: 0 !important;
                    }
                    .profile-credits {
                        flex-direction: column !important;
                        align-items: center !important;
                        text-align: center !important;
                        padding: 0.875rem !important;
                        gap: 0.75rem !important;
                    }
                    .profile-credits-icon {
                        margin-bottom: 0 !important;
                    }
                    .profile-buttons {
                        flex-direction: column !important;
                    }
                    .profile-buttons button {
                        width: 100%;
                    }
                    .profile-sections {
                        gap: 0.875rem !important;
                    }
                    .profile-section {
                        padding: 0.75rem 0 !important;
                    }
                    .profile-section h3 {
                        margin-bottom: 0.5rem !important;
                        padding-bottom: 0.25rem !important;
                    }
                    .profile-section p {
                        margin: 0 !important;
                        line-height: 1.4 !important;
                    }
                    .badge {
                        padding: 0.3rem 0.6rem !important;
                        font-size: 0.75rem !important;
                    }
                }
                @media (max-width: 480px) {
                    h1 {
                        font-size: 1.375rem !important;
                    }
                    h2 {
                        font-size: 1.125rem !important;
                    }
                    h3 {
                        font-size: 0.95rem !important;
                    }
                }
            `}</style>
            <div className="card profile-card">
                <div className="profile-header" style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem',
                    gap: '0.75rem'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(0.75rem, 2vw, 1rem)', minWidth: 0 }}>
                        <div style={{
                            width: '45px',
                            height: '45px',
                            minWidth: '45px',
                            background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                            borderRadius: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.3)'
                        }}>
                            <User color="white" size={20} />
                        </div>
                        <h1 style={{ fontSize: 'clamp(1.375rem, 3.5vw, 1.625rem)', margin: 0 }}>My Profile</h1>
                    </div>

                    {!isEditing && (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="btn btn-primary profile-edit-btn"
                            style={{ whiteSpace: 'nowrap', padding: 'clamp(0.5rem, 1vw, 0.75rem) clamp(0.75rem, 2vw, 1rem)', fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)' }}
                        >
                            <Edit2 size={14} /> Edit
                        </button>
                    )}
                </div>

                {isEditing ? (
                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                className="input-field"
                                value={formData.full_name}
                                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Bio</label>
                            <textarea
                                className="input-field"
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                rows="3"
                            />
                        </div>
                        <div className="profile-buttons" style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                                <Save size={16} /> Save
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="btn btn-secondary"
                                style={{ flex: 1 }}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="profile-sections" style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(1rem, 2vw, 1.25rem)' }}>
                        <div className="profile-user-card glass-panel" style={{ 
                            padding: 'clamp(0.875rem, 2vw, 1.25rem)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 'clamp(0.875rem, 2vw, 1.25rem)'
                        }}>
                            <div className="profile-avatar" style={{
                                width: 'clamp(55px, 12vw, 70px)',
                                height: 'clamp(55px, 12vw, 70px)',
                                minWidth: 'clamp(55px, 12vw, 70px)',
                                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: 'clamp(1.25rem, 4vw, 1.75rem)',
                                color: 'white',
                                fontWeight: 'bold'
                            }}>
                                {profile?.full_name?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <div style={{ minWidth: 0 }}>
                                <h2 style={{ fontSize: 'clamp(1.125rem, 3.5vw, 1.375rem)', marginBottom: '0.125rem', margin: 0 }}>{profile?.full_name || 'Unknown'}</h2>
                                <p style={{ color: 'var(--text-muted)', marginBottom: '0.25rem', margin: 0, fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)' }}>Roll: {profile?.roll_no || 'N/A'}</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--text-muted)', fontSize: 'clamp(0.75rem, 1.5vw, 0.85rem)', wordBreak: 'break-word' }}>
                                    <Mail size={14} />
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{profile?.email || 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="profile-credits glass-panel" style={{
                            padding: 'clamp(0.875rem, 2vw, 1.25rem)',
                            background: 'linear-gradient(135deg, rgba(147, 112, 219, 0.1), rgba(168, 85, 247, 0.05))',
                            border: '2px solid rgba(147, 112, 219, 0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 'clamp(0.875rem, 2vw, 1.25rem)'
                        }}>
                            <div className="profile-credits-icon" style={{
                                width: 'clamp(45px, 10vw, 55px)',
                                height: 'clamp(45px, 10vw, 55px)',
                                minWidth: 'clamp(45px, 10vw, 55px)',
                                background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                flexShrink: 0
                            }}>
                                <Coins size="clamp(18px, 4vw, 24px)" />
                            </div>
                            <div style={{ minWidth: 0 }}>
                                <p style={{ margin: 0, fontSize: 'clamp(0.7rem, 1.5vw, 0.8rem)', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>Credits Available</p>
                                <p style={{ margin: '0.15rem 0 0 0', fontSize: 'clamp(1.375rem, 4vw, 1.75rem)', fontWeight: '700', color: 'var(--primary)' }}>
                                    {user?.credits || 0}
                                </p>
                                <p style={{ margin: '0.25rem 0 0 0', fontSize: 'clamp(0.7rem, 1.3vw, 0.8rem)', color: 'var(--text-muted)' }}>
                                    Book learning sessions
                                </p>
                            </div>
                        </div>

                        <div className="profile-section">
                            <h3 style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1rem)', marginBottom: '0.5rem', borderBottom: '2px solid var(--border)', paddingBottom: '0.25rem', margin: 0 }}>About Me</h3>
                            <p style={{ lineHeight: '1.4', color: 'var(--text)', fontSize: 'clamp(0.85rem, 1.5vw, 0.95rem)', marginTop: '0.5rem', margin: 0 }}>
                                {profile.bio || 'No bio provided yet.'}
                            </p>
                        </div>

                        <div className="profile-section">
                            <h3 style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1rem)', marginBottom: '0.5rem', borderBottom: '2px solid var(--border)', paddingBottom: '0.25rem', margin: 0 }}>Skills I Offer</h3>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                                {profile.offeredSkills?.length > 0 ? (
                                    profile.offeredSkills.map(skill => (
                                        <span
                                            key={skill.id}
                                            className="badge badge-primary"
                                            style={{ padding: 'clamp(0.3rem, 0.8vw, 0.4rem) clamp(0.6rem, 1.5vw, 0.85rem)', fontSize: 'clamp(0.75rem, 1.3vw, 0.85rem)' }}
                                        >
                                            {skill.name} • {skill.UserSkill.proficiency}
                                        </span>
                                    ))
                                ) : (
                                    <p style={{ color: 'var(--text-muted)', fontSize: 'clamp(0.85rem, 1.5vw, 0.95rem)', margin: 0 }}>No skills offered yet.</p>
                                )}
                            </div>
                        </div>

                        <div className="profile-section">
                            <h3 style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1rem)', marginBottom: '0.5rem', borderBottom: '2px solid var(--border)', paddingBottom: '0.25rem', margin: 0 }}>My Rating & Reviews</h3>
                            <div style={{ marginTop: '1rem' }}>
                                <RatingDisplay 
                                    averageRating={profile.ratings?.averageRating || 0} 
                                    totalFeedbacks={profile.ratings?.totalFeedbacks || 0}
                                />
                            </div>
                        </div>

                        <div className="profile-section">
                            <h3 style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1rem)', marginBottom: '0.5rem', borderBottom: '2px solid var(--border)', paddingBottom: '0.25rem', margin: 0 }}>Recent Feedback</h3>
                            <div style={{ marginTop: '1rem' }}>
                                <UserFeedback userId={profile.id} showAll={false} />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
