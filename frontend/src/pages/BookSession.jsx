import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, User, BookOpen, AlertCircle, Coins } from 'lucide-react';

const BookSession = () => {
    const { user } = useAuth();
    const [skills, setSkills] = useState([]);
    const [tutors, setTutors] = useState([]);
    const [selectedSkill, setSelectedSkill] = useState('');
    const [selectedTutor, setSelectedTutor] = useState('');
    const [scheduledTime, setScheduledTime] = useState('');
    const [meetingLink, setMeetingLink] = useState('');
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

    const fetchTutors = async (skillId) => {
        if (!skillId) {
            setTutors([]);
            return;
        }
        setLoading(true);
        try {
            // Re-using search endpoint or we can add a specific endpoint to get providers by skill
            // For now, let's use the search endpoint which returns skills with providers
            const response = await api.get(`/search/skills?q=${skills.find(s => s.id === skillId)?.name || ''}`);
            // The search endpoint returns skills with providers included. 
            // We need to extract providers from the matching skill.
            const matchingSkill = response.data.find(s => s.id === skillId);
            setTutors(matchingSkill ? matchingSkill.providers : []);
        } catch (error) {
            console.error('Error fetching tutors:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSkillChange = (e) => {
        const skillId = e.target.value;
        setSelectedSkill(skillId);
        setSelectedTutor('');
        fetchTutors(skillId);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await api.post('/sessions/request', {
                providerId: selectedTutor,
                skillId: selectedSkill,
                scheduled_time: scheduledTime,
                meeting_link: meetingLink
            });
            alert('Session request sent successfully!');
            navigate('/dashboard');
        } catch (error) {
            console.error('Error booking session:', error);
            setError(error.response?.data?.message || 'Failed to book session.');
        }
    };

    return (
        <div className="auth-container" style={{ alignItems: 'flex-start', paddingTop: '4rem' }}>
            <div className="auth-card" style={{ maxWidth: '600px' }}>
                <div className="auth-header">
                    <Calendar className="auth-icon" size={32} />
                    <h2>Book a Session</h2>
                    <p>Schedule a learning session with a tutor</p>
                </div>

                {/* Credit Information Box */}
                <div style={{
                    background: 'rgba(147, 112, 219, 0.1)',
                    border: '1px solid rgba(147, 112, 219, 0.3)',
                    borderRadius: '0.5rem',
                    padding: '1rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem'
                }}>
                    <Coins size={20} style={{ color: 'var(--primary)' }} />
                    <div>
                        <p style={{ margin: '0', fontWeight: '600', color: 'var(--primary)' }}>
                            Your Credits: {user?.credits || 0}
                        </p>
                        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                            Booking a session costs 5 credits (transferred to tutor upon acceptance)
                        </p>
                    </div>
                </div>

                {user?.credits < 5 && (
                    <div style={{
                        background: '#fee2e2',
                        border: '1px solid #fecaca',
                        borderRadius: '0.5rem',
                        padding: '1rem',
                        marginBottom: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        color: '#991b1b'
                    }}>
                        <AlertCircle size={20} />
                        <div>
                            <p style={{ margin: '0', fontWeight: '600' }}>
                                Insufficient Credits
                            </p>
                            <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem' }}>
                                You need at least 5 credits to book a session. You currently have {user?.credits || 0}.
                            </p>
                        </div>
                    </div>
                )}

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
                        <label>Select Skill</label>
                        <div style={{ position: 'relative' }}>
                            <BookOpen size={18} style={{ position: 'absolute', top: '12px', left: '10px', color: '#64748b' }} />
                            <select
                                value={selectedSkill}
                                onChange={handleSkillChange}
                                style={{ padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', width: '100%' }}
                                required
                            >
                                <option value="">-- Choose a skill to learn --</option>
                                {skills.map(skill => (
                                    <option key={skill.id} value={skill.id}>{skill.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Select Tutor</label>
                        <div style={{ position: 'relative' }}>
                            <User size={18} style={{ position: 'absolute', top: '12px', left: '10px', color: '#64748b' }} />
                            <select
                                value={selectedTutor}
                                onChange={(e) => setSelectedTutor(e.target.value)}
                                style={{ padding: '0.75rem 0.75rem 0.75rem 2.5rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', width: '100%' }}
                                required
                                disabled={!selectedSkill}
                            >
                                <option value="">-- Choose a tutor --</option>
                                {tutors.map(tutor => (
                                    <option key={tutor.id} value={tutor.id}>
                                        {tutor.full_name} ({tutor.UserSkill.proficiency})
                                    </option>
                                ))}
                            </select>
                        </div>
                        {selectedSkill && tutors.length === 0 && !loading && (
                            <p style={{ fontSize: '0.875rem', color: '#ef4444', marginTop: '0.5rem' }}>No tutors available for this skill.</p>
                        )}
                        {loading && <p>Loading tutors...</p>}
                    </div>

                    <div className="form-group">
                        <label>Scheduled Time</label>
                        <input
                            type="datetime-local"
                            value={scheduledTime}
                            onChange={(e) => setScheduledTime(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Valid Meeting Link (Optional)</label>
                        <input
                            type="text"
                            value={meetingLink}
                            onChange={(e) => setMeetingLink(e.target.value)}
                            placeholder="Zoom/Google Meet link"
                        />
                    </div>

                    <button 
                        type="submit" 
                        className="btn-primary" 
                        disabled={!selectedTutor || !scheduledTime || (user?.credits < 5)}
                    >
                        Send Request
                    </button>
                </form>
            </div>
        </div>
    );
};

export default BookSession;
