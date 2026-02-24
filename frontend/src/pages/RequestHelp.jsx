import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HelpCircle, Lightbulb, Zap } from 'lucide-react';

const RequestHelp = () => {
    const { user } = useAuth();
    const [skills, setSkills] = useState([]);
    const [selectedSkill, setSelectedSkill] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [urgency, setUrgency] = useState('normal');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchSkills();
    }, []);

    const fetchSkills = async () => {
        try {
            const response = await api.get('/skills');
            setSkills(response.data);
        } catch (error) {
            console.error('Error fetching skills:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        
        try {
            await api.post('/skills/request', {
                skillId: selectedSkill || null,
                description: `${title ? `Title: ${title}\n\n` : ''}${description}`
            });

            alert('Skill request posted successfully! Tutors will review and respond to your request.');
            navigate('/skills-hub');
        } catch (error) {
            console.error('Error requesting help:', error);
            setError(error.response?.data?.message || 'Failed to post request. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="auth-container" style={{ alignItems: 'flex-start', paddingTop: '4rem' }}>
            <div className="auth-card" style={{ maxWidth: '700px', width: '100%' }}>
                <div className="auth-header">
                    <HelpCircle className="auth-icon" size={32} />
                    <h2>Request a Skill</h2>
                    <p>Post a skill you want to learn - tutors in the community will help</p>
                </div>

                {/* Info Box */}
                <div style={{
                    background: '#f0f9ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem'
                }}>
                    <Lightbulb size={20} style={{ color: '#0284c7', marginTop: '0.25rem', flexShrink: 0 }} />
                    <div>
                        <p style={{ margin: '0', fontWeight: '600', color: '#0284c7' }}>
                            Tips for getting responses:
                        </p>
                        <ul style={{
                            margin: '0.5rem 0 0 0',
                            paddingLeft: '1.25rem',
                            fontSize: '0.875rem',
                            color: '#0c4a6e'
                        }}>
                            <li>Be specific about what you want to learn</li>
                            <li>Mention your current level if possible</li>
                            <li>Add context about why you want to learn this</li>
                            <li>Tutors will reach out with session recommendations</li>
                        </ul>
                    </div>
                </div>

                {error && (
                    <div style={{
                        background: '#fee2e2',
                        border: '1px solid #fecaca',
                        borderRadius: '0.5rem',
                        padding: '1rem',
                        marginBottom: '1rem',
                        color: '#991b1b'
                    }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Related Skill *</label>
                        <select
                            value={selectedSkill}
                            onChange={(e) => setSelectedSkill(e.target.value)}
                            required
                            style={{ 
                                padding: '0.75rem', 
                                borderRadius: '0.5rem', 
                                border: '1px solid #e2e8f0',
                                width: '100%'
                            }}
                        >
                            <option value="">-- Select a skill category --</option>
                            {skills.map(skill => (
                                <option key={skill.id} value={skill.id}>
                                    {skill.name} ({skill.category})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>Title of Your Request *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., 'Help me understand React Hooks'"
                            required
                            style={{ 
                                padding: '0.75rem', 
                                borderRadius: '0.5rem', 
                                border: '1px solid #e2e8f0',
                                width: '100%',
                                boxSizing: 'border-box'
                            }}
                        />
                    </div>

                    <div className="form-group">
                        <label>Detailed Description *</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe what you want to learn, your current level, what you've already tried, and any specific goals..."
                            rows="6"
                            required
                            style={{ 
                                padding: '0.75rem', 
                                borderRadius: '0.5rem', 
                                border: '1px solid #e2e8f0',
                                width: '100%',
                                boxSizing: 'border-box',
                                fontFamily: 'inherit',
                                resize: 'vertical'
                            }}
                        />
                        <p style={{ 
                            fontSize: '0.75rem', 
                            color: 'var(--text-muted)', 
                            margin: '0.5rem 0 0 0' 
                        }}>
                            More details help tutors understand your needs better
                        </p>
                    </div>

                    <div className="form-group">
                        <label>Urgency Level</label>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                            {[
                                { value: 'low', label: '📅 Low - I can wait', icon: '📅' },
                                { value: 'normal', label: '⏱️ Normal - Soon would be nice', icon: '⏱️' },
                                { value: 'high', label: '🔥 High - Need it ASAP', icon: '🔥' }
                            ].map(option => (
                                <label 
                                    key={option.value}
                                    style={{
                                        flex: 1,
                                        padding: '0.75rem',
                                        border: `2px solid ${urgency === option.value ? 'var(--primary)' : '#e2e8f0'}`,
                                        borderRadius: '0.5rem',
                                        cursor: 'pointer',
                                        background: urgency === option.value ? 'rgba(147, 112, 219, 0.05)' : 'transparent',
                                        textAlign: 'center',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <input
                                        type="radio"
                                        value={option.value}
                                        checked={urgency === option.value}
                                        onChange={(e) => setUrgency(e.target.value)}
                                        style={{ marginRight: '0.5rem', cursor: 'pointer' }}
                                    />
                                    {option.label}
                                </label>
                            ))}
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        className="btn-primary"
                        disabled={loading || !selectedSkill || !title || !description}
                        style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center',
                            gap: '0.5rem',
                            opacity: (loading || !selectedSkill || !title || !description) ? 0.5 : 1
                        }}
                    >
                        <Zap size={18} />
                        {loading ? 'Posting...' : 'Post Request'}
                    </button>
                </form>

                {/* Additional Help Section */}
                <div style={{
                    marginTop: '2rem',
                    paddingTop: '1.5rem',
                    borderTop: '1px solid #e2e8f0'
                }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>
                        <strong>💡 How it works:</strong> Once you post a request, tutors offering that skill will review it. 
                        They may reach out through your profile or book a session with you. When a tutor accepts a session 
                        with you, 5 credits will be transferred from your account to theirs.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RequestHelp;
