import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Video, Clock, User, X, ExternalLink, AlertCircle } from 'lucide-react';

const MeetingSidebar = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeMeeting, setActiveMeeting] = useState(null);
    const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

    useEffect(() => {
        fetchMeetings();
        // Refresh meetings every 30 seconds
        const interval = setInterval(fetchMeetings, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchMeetings = async () => {
        try {
            const res = await api.get('/sessions/meetings/active');
            setMeetings(res.data || []);
        } catch (error) {
            console.error('Error fetching meetings:', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'No date';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const formatTime = (timeString) => {
        if (!timeString) return 'No time';
        // If it's a timestamp, convert it
        if (timeString.includes('-')) {
            return timeString; // It's already in HH:MM format
        }
        const date = new Date(timeString);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    const getMeetingDetails = (meeting) => {
        const isUserTutor = meeting.tutor_id === user?.id;
        const otherUser = isUserTutor ? meeting.learner : meeting.tutor;
        const date = meeting.confirmed_slot?.date || 'No date';
        const startTime = meeting.confirmed_slot?.startTime || 'No time';
        const endTime = meeting.confirmed_slot?.endTime || 'No time';

        return {
            otherUser,
            isUserTutor,
            date,
            startTime,
            endTime
        };
    };

    const handleJoinMeeting = (meeting) => {
        if (meeting.meeting_link) {
            setActiveMeeting(meeting);
            // Open the meeting in the same window
            navigate(`/meeting/${meeting.id}`, { state: { meeting } });
        }
    };

    const handleMeetingComplete = async (meeting) => {
        if (window.confirm('Mark this meeting as completed?')) {
            try {
                await api.put(`/sessions/${meeting.id}/complete`);
                showAlert('Meeting marked as completed', 'success');
                fetchMeetings();
            } catch (error) {
                console.error('Error completing meeting:', error);
                showAlert('Failed to complete meeting', 'error');
            }
        }
    };

    const showAlert = (message, type = 'success') => {
        setAlert({ show: true, message, type });
        setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 3000);
    };

    if (loading) {
        return null;
    }

    if (meetings.length === 0) {
        return null;
    }

    return (
        <>
            {/* Alert */}
            {alert.show && (
                <div style={{
                    position: 'fixed',
                    top: '80px',
                    right: '20px',
                    padding: '1rem 1.5rem',
                    borderRadius: '8px',
                    background: alert.type === 'success' ? '#d1fae5' : '#fee2e2',
                    color: alert.type === 'success' ? '#047857' : '#dc2626',
                    border: `1px solid ${alert.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    zIndex: 10000,
                    animation: 'slideInDown 0.3s ease-out'
                }}>
                    {alert.message}
                </div>
            )}

            {/* Sidebar */}
            <div style={{
                position: 'fixed',
                right: '20px',
                top: '100px',
                width: '320px',
                maxHeight: 'calc(100vh - 140px)',
                background: 'white',
                borderRadius: '12px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
                border: '1px solid #e2e8f0',
                zIndex: 999,
                overflowY: 'auto',
                animation: 'slideInRight 0.3s ease-out'
            }}>
                {/* Header */}
                <div style={{
                    padding: '1.25rem',
                    borderBottom: '1px solid #e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    borderRadius: '12px 12px 0 0'
                }}>
                    <Video size={20} />
                    <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '600' }}>
                        Upcoming Meetings
                    </h3>
                    {meetings.length > 0 && (
                        <span style={{
                            marginLeft: 'auto',
                            background: 'rgba(255,255,255,0.3)',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '20px',
                            fontSize: '0.875rem',
                            fontWeight: '600'
                        }}>
                            {meetings.length}
                        </span>
                    )}
                </div>

                {/* Meetings List */}
                <div style={{ padding: '0.75rem' }}>
                    {meetings.map((meeting) => {
                        const { otherUser, isUserTutor, date, startTime, endTime } =  getMeetingDetails(meeting);
                        return (
                            <div
                                key={meeting.id}
                                style={{
                                    padding: '1rem',
                                    marginBottom: '0.75rem',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    background: '#f8fafc',
                                    hoverEffect: 'true'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = '#f0f4f8';
                                    e.currentTarget.style.borderColor = '#cbd5e0';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = '#f8fafc';
                                    e.currentTarget.style.borderColor = '#e2e8f0';
                                }}
                            >
                                {/* Meeting Title */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                    <Video size={16} style={{ color: '#667eea', flexShrink: 0 }} />
                                    <p style={{
                                        margin: 0,
                                        fontSize: '0.875rem',
                                        fontWeight: '600',
                                        color: '#1e293b',
                                        flex: 1,
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis'
                                    }}>
                                        {isUserTutor ? 'Teaching' : 'Learning'}
                                    </p>
                                    <span style={{
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '4px',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        background: meeting.status === 'scheduled' ? '#dbeafe' : '#e0e7ff',
                                        color: meeting.status === 'scheduled' ? '#0369a1' : '#4338ca',
                                        textTransform: 'capitalize'
                                    }}>
                                        {meeting.status}
                                    </span>
                                </div>

                                {/* User Info */}
                                {otherUser && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                        <User size={14} style={{ color: '#64748b', flexShrink: 0 }} />
                                        <p style={{
                                            margin: 0,
                                            fontSize: '0.8rem',
                                            color: '#64748b',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis'
                                        }}>
                                            {otherUser.full_name}
                                        </p>
                                    </div>
                                )}

                                {/* Date & Time */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                    <Clock size={14} style={{ color: '#64748b', flexShrink: 0 }} />
                                    <p style={{
                                        margin: 0,
                                        fontSize: '0.8rem',
                                        color: '#64748b'
                                    }}>
                                        {date} • {startTime}
                                    </p>
                                </div>

                                {/* Actions */}
                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                                    <button
                                        onClick={() => handleJoinMeeting(meeting)}
                                        style={{
                                            flex: 1,
                                            padding: '0.5rem 0.75rem',
                                            borderRadius: '6px',
                                            border: 'none',
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            color: 'white',
                                            fontSize: '0.8rem',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.35rem',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.4)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    >
                                        <ExternalLink size={14} />
                                        Join
                                    </button>
                                    <button
                                        onClick={() => handleMeetingComplete(meeting)}
                                        style={{
                                            padding: '0.5rem 0.75rem',
                                            borderRadius: '6px',
                                            border: '1px solid #e2e8f0',
                                            background: 'white',
                                            color: '#64748b',
                                            fontSize: '0.8rem',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = '#f8fafc';
                                            e.currentTarget.style.borderColor = '#cbd5e0';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'white';
                                            e.currentTarget.style.borderColor = '#e2e8f0';
                                        }}
                                    >
                                        ✓ Done
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <style>{`
                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }

                @keyframes slideInDown {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                /* Scrollbar styling */
                div::-webkit-scrollbar {
                    width: 6px;
                }

                div::-webkit-scrollbar-track {
                    background: #f1f5f9;
                    borderRadius: 10px;
                }

                div::-webkit-scrollbar-thumb {
                    background: #cbd5e0;
                    borderRadius: 10px;
                }

                div::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>
        </>
    );
};

export default MeetingSidebar;
