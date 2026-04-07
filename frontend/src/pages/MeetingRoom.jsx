import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { LogOut, ExternalLink, CheckCircle, Clock } from 'lucide-react';
import FeedbackForm from '../components/FeedbackForm';

const MeetingRoom = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [meeting, setMeeting] = useState(null);
    const [sessionDuration, setSessionDuration] = useState(0);
    const [meetingEnded, setMeetingEnded] = useState(false);
    const [meetingOpened, setMeetingOpened] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    const [otherUserId, setOtherUserId] = useState(null);
    const windowRef = React.useRef(null);

    useEffect(() => {
        if (location.state?.meeting) {
            const meetingData = location.state.meeting;
            setMeeting(meetingData);
            
            // Auto-open the meeting in a new window
            setTimeout(() => {
                openMeetingWindow(meetingData);
            }, 500);
        }
    }, []);

    // Track session duration
    useEffect(() => {
        if (!meetingEnded && meeting) {
            const interval = setInterval(() => {
                setSessionDuration(prev => prev + 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [meetingEnded, meeting]);

    // Check if the meeting window is closed
    useEffect(() => {
        if (meetingOpened) {
            const checkInterval = setInterval(() => {
                if (windowRef.current && windowRef.current.closed) {
                    clearInterval(checkInterval);
                    handleMeetingEnd();
                }
            }, 1000);
            return () => clearInterval(checkInterval);
        }
    }, [meetingOpened]);

    const openMeetingWindow = (meetingData) => {
        try {
            let url = meetingData.meeting_link;

            // Extract room name for Whereby
            if (meetingData.provider_room_id) {
                url = `https://whereby.com/${meetingData.provider_room_id}`;
            } else if (meetingData.meeting_link && meetingData.meeting_link.includes('whereby.com/embed/')) {
                // Convert embed URL to regular URL
                const roomName = meetingData.meeting_link.split('/embed/')[1];
                url = `https://whereby.com/${roomName}`;
            }

            console.log('🎥 Opening meeting:', url);
            windowRef.current = window.open(url, 'SkillX_Meeting', 'width=1000,height=700');
            
            if (windowRef.current) {
                setMeetingOpened(true);
                console.log('✅ Meeting window opened');
            } else {
                alert('Unable to open meeting. Please allow pop-ups in your browser.');
            }
        } catch (err) {
            console.error('Error opening meeting:', err);
            alert('Failed to open meeting: ' + err.message);
        }
    };

    const handleMeetingEnd = async () => {
        try {
            if (meeting) {
                console.log('📍 Marking meeting as completed...');
                await api.put(`/sessions/${meeting.id}/complete`);
                console.log('✅ Meeting marked as completed');
                
                // Determine the other user ID and feedback type
                // If tutor_id and learner_id are in the meeting data
                if (meeting.tutor_id && meeting.learner_id) {
                    if (user.id === meeting.tutor_id) {
                        setOtherUserId(meeting.learner_id);
                    } else {
                        setOtherUserId(meeting.tutor_id);
                    }
                } else {
                    // If not available, we can still get other participant info if needed
                    // For now, show feedback form anyway - will need to know other user ID
                    console.warn('Tutor/Learner IDs not available, feedback may not work');
                }
            }
            setShowFeedback(true);
        } catch (error) {
            console.error('Error completing meeting:', error);
            setMeetingEnded(true);
            setTimeout(() => {
                navigate('/dashboard', { replace: true });
            }, 3000);
        }
    };

    const handleEndMeeting = () => {
        if (window.confirm('Are you sure you want to end this meeting?')) {
            if (windowRef.current && !windowRef.current.closed) {
                windowRef.current.close();
            }
            handleMeetingEnd();
        }
    };

    const formatDuration = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }
        return `${minutes}:${String(secs).padStart(2, '0')}`;
    };

    if (showFeedback && otherUserId) {
        const feedbackType = user.id === meeting.tutor_id ? 'tutor_to_learner' : 'learner_to_tutor';
        return (
            <FeedbackForm
                sessionId={meeting.id}
                toUserId={otherUserId}
                feedbackType={feedbackType}
                onClose={() => {
                    navigate('/dashboard', { replace: true });
                }}
                onSuccess={() => {
                    console.log('✅ Feedback submitted successfully');
                }}
            />
        );
    }

    if (showFeedback && !otherUserId) {
        // Feedback form wanted but no other user ID - just redirect
        setTimeout(() => {
            navigate('/dashboard', { replace: true });
        }, 1000);
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '1rem'
            }}>
                <div style={{
                    background: 'white',
                    padding: '2rem',
                    borderRadius: '12px',
                    textAlign: 'center',
                    maxWidth: '400px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
                }}>
                    <CheckCircle size={48} style={{ color: '#10b981', margin: '0 auto 1rem' }} />
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#1f2937' }}>
                        Meeting Completed!
                    </h2>
                    <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
                        Redirecting to dashboard...
                    </p>
                </div>
            </div>
        );
    }

    if (meetingEnded) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '1rem'
            }}>
                <div style={{
                    background: 'white',
                    padding: '2rem',
                    borderRadius: '12px',
                    textAlign: 'center',
                    maxWidth: '400px',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
                }}>
                    <CheckCircle size={48} style={{ color: '#10b981', margin: '0 auto 1rem' }} />
                    <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#1f2937' }}>
                        Meeting Completed!
                    </h2>
                    <p style={{ color: '#6b7280', marginBottom: '1rem' }}>
                        Duration: <strong>{formatDuration(sessionDuration)}</strong>
                    </p>
                    <p style={{ color: '#9ca3af', fontSize: '0.9rem' }}>
                        Redirecting to dashboard in 3 seconds...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            background: '#f3f4f6'
        }}>
            {/* Top Bar */}
            <div style={{
                background: '#1f2937',
                color: 'white',
                padding: '1rem 1.5rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h1 style={{ margin: 0, fontSize: '1.25rem' }}>
                        🎥 {meeting?.learner_name || 'Meeting'} 
                    </h1>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '1rem',
                        color: '#e5e7eb'
                    }}>
                        <Clock size={20} />
                        Duration: <strong>{formatDuration(sessionDuration)}</strong>
                    </div>
                    <button
                        onClick={handleEndMeeting}
                        style={{
                            padding: '0.5rem 1rem',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '1rem',
                            fontWeight: '500',
                            transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.background = '#dc2626'}
                        onMouseOut={(e) => e.target.style.background = '#ef4444'}
                    >
                        <LogOut size={18} />
                        Leave Meeting
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem'
            }}>
                <div style={{
                    background: 'white',
                    padding: '2rem',
                    borderRadius: '12px',
                    textAlign: 'center',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    maxWidth: '500px'
                }}>
                    <ExternalLink size={48} style={{
                        color: '#667eea',
                        margin: '0 auto 1rem'
                    }} />
                    
                    <h2 style={{
                        fontSize: '1.5rem',
                        marginBottom: '0.5rem',
                        color: '#1f2937'
                    }}>
                        Meeting Opened
                    </h2>
                    
                    <p style={{
                        color: '#6b7280',
                        marginBottom: '1.5rem',
                        lineHeight: '1.6'
                    }}>
                        The meeting has been opened in a new window. 
                        <br />
                        <strong>Allow camera & microphone permissions</strong> when prompted.
                    </p>

                    {meeting && (
                        <div style={{
                            background: '#f9fafb',
                            padding: '1rem',
                            borderRadius: '8px',
                            marginBottom: '1.5rem',
                            textAlign: 'left'
                        }}>
                            <p style={{ margin: '0.5rem 0', color: '#4b5563' }}>
                                <strong>Meeting:</strong> {meeting.learner_name}
                            </p>
                            <p style={{ margin: '0.5rem 0', color: '#4b5563' }}>
                                <strong>Provider:</strong> Whereby.com
                            </p>
                            <p style={{ margin: '0.5rem 0', color: '#4b5563' }}>
                                <strong>Room:</strong> {meeting.provider_room_id || 'skillexchange'}
                            </p>
                        </div>
                    )}

                    <button
                        onClick={handleEndMeeting}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '1rem',
                            fontWeight: '500',
                            transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => e.target.style.background = '#dc2626'}
                        onMouseOut={(e) => e.target.style.background = '#ef4444'}
                    >
                        End Meeting
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MeetingRoom;
