import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Video, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../services/api';

const UpcomingMeetings = ({ collapsed = false, isMobile = false }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [meetings, setMeetings] = useState([]);
    const [isExpanded, setIsExpanded] = useState(!collapsed || isMobile);
    const [loading, setLoading] = useState(false);

    const fetchMeetings = async () => {
        if (!user) return;
        try {
            setLoading(true);
            const res = await api.get('/sessions/meetings/active');
            setMeetings(res.data || []);
        } catch (error) {
            console.error('Failed to fetch meetings:', error);
            setMeetings([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMeetings();
        const interval = setInterval(fetchMeetings, 30000);
        return () => clearInterval(interval);
    }, [user]);

    const handleJoinMeeting = (meeting) => {
        navigate(`/meeting/${meeting.id}`, { state: { meeting } });
    };

    const handleMeetingComplete = async (meetingId, e) => {
        e.stopPropagation();
        try {
            await api.put(`/sessions/${meetingId}/complete`);
            setMeetings(meetings.filter(m => m.id !== meetingId));
        } catch (error) {
            console.error('Failed to complete meeting:', error);
        }
    };

    const formatDateTime = (confirmedSlot) => {
        if (!confirmedSlot) return '';
        
        // confirmed_slot is an object with { date, startTime, endTime }
        let dateString = null;
        
        if (typeof confirmedSlot === 'object' && confirmedSlot.date) {
            // It's a JSONB object from database
            dateString = confirmedSlot.date;
        } else if (typeof confirmedSlot === 'string') {
            // It's already a date string
            dateString = confirmedSlot;
        }
        
        if (!dateString) return '';
        
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Invalid Date';
            
            const now = new Date();
            const isToday = date.toDateString() === now.toDateString();
            const isTomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString() === date.toDateString();

            // Get time from either object or string, default to 10:00 AM if not available
            let timeStr = '10:00 AM';
            if (typeof confirmedSlot === 'object' && confirmedSlot.startTime) {
                timeStr = confirmedSlot.startTime; // e.g., "14:30"
                // Convert 24-hour format to 12-hour if needed
                const [hours, minutes] = timeStr.split(':');
                const hour = parseInt(hours);
                const ampm = hour >= 12 ? 'PM' : 'AM';
                const displayHour = hour % 12 || 12;
                timeStr = `${displayHour}:${minutes} ${ampm}`;
            }
            
            if (isToday) return `Today · ${timeStr}`;
            if (isTomorrow) return `Tomorrow · ${timeStr}`;
            
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ' · ' + timeStr;
        } catch (error) {
            console.error('Date parsing error:', error);
            return 'Invalid Date';
        }
    };

    const getMeetingRole = (meeting) => {
        if (meeting.learner_id === user?.id) {
            return 'Learning';
        }
        return 'Teaching';
    };

    if (meetings.length === 0 && !loading) {
        return null;
    }

    return (
        <div style={{
            margin: '1rem 0.75rem 0',
            borderTop: '1px solid var(--border)',
            paddingTop: '1rem',
        }}>
            {/* Section Header */}
            <button
                onClick={() => !collapsed && !isMobile && setIsExpanded(!isExpanded)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: collapsed && !isMobile ? 'center' : 'space-between',
                    padding: collapsed && !isMobile ? '0.5rem 0.75rem' : '0.5rem 1rem',
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    cursor: collapsed && !isMobile ? 'default' : 'pointer',
                    color: 'var(--text-muted)',
                    fontSize: '0.68rem',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: '0.5rem',
                    transition: 'color 0.2s ease',
                }}
                onMouseEnter={e => {
                    if (!collapsed && !isMobile) {
                        e.currentTarget.style.color = 'var(--text)';
                    }
                }}
                onMouseLeave={e => {
                    e.currentTarget.style.color = 'var(--text-muted)';
                }}
                title={collapsed && !isMobile ? 'Meetings' : ''}
            >
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Video size={14} style={{ flexShrink: 0 }} />
                    {(!collapsed || isMobile) && 'Upcoming Meetings'}
                </span>
                {(!collapsed || isMobile) && (
                    isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                )}
            </button>

            {/* Meetings List */}
            {(isExpanded || collapsed) && (
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    padding: collapsed && !isMobile ? '0' : '0 0.75rem',
                }}>
                    {meetings.slice(0, 5).map((meeting) => (
                        <div
                            key={meeting.id}
                            onClick={() => handleJoinMeeting(meeting)}
                            style={{
                                padding: collapsed && !isMobile ? '0.5rem 0.5rem' : '0.75rem 0.75rem',
                                background: 'rgba(99,102,241,0.08)',
                                border: '1px solid var(--border)',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.4rem',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = 'rgba(99,102,241,0.15)';
                                e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = 'rgba(99,102,241,0.08)';
                                e.currentTarget.style.borderColor = 'var(--border)';
                            }}
                            title={collapsed && !isMobile ? `${getMeetingRole(meeting)} - ${meeting.learner_name}` : ''}
                        >
                            {(!collapsed || isMobile) && (
                                <>
                                    {/* Role Badge */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                    }}>
                                        <span style={{
                                            fontSize: '0.7rem',
                                            fontWeight: '600',
                                            color: 'var(--primary)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.3rem',
                                        }}>
                                            <Video size={12} />
                                            {getMeetingRole(meeting)}
                                        </span>
                                        <span style={{
                                            fontSize: '0.65rem',
                                            fontWeight: '700',
                                            padding: '0.2rem 0.5rem',
                                            background: 'rgba(59,130,246,0.15)',
                                            color: '#3b82f6',
                                            borderRadius: '4px',
                                        }}>
                                            Scheduled
                                        </span>
                                    </div>

                                    {/* Participant Name */}
                                    <p style={{
                                        margin: 0,
                                        fontSize: '0.8rem',
                                        fontWeight: '600',
                                        color: 'var(--text)',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                    }}>
                                        {meeting.learner_name}
                                    </p>

                                    {/* Date and Time */}
                                    <p style={{
                                        margin: 0,
                                        fontSize: '0.75rem',
                                        color: 'var(--text-muted)',
                                    }}>
                                        {formatDateTime(meeting.confirmed_slot?.scheduled_time || meeting.confirmed_slot)}
                                    </p>

                                    {/* Actions */}
                                    <div style={{
                                        display: 'flex',
                                        gap: '0.5rem',
                                        marginTop: '0.25rem',
                                    }}>
                                        <button
                                            onClick={() => handleJoinMeeting(meeting)}
                                            style={{
                                                flex: 1,
                                                padding: '0.4rem',
                                                background: 'var(--primary)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                fontSize: '0.7rem',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                transition: 'opacity 0.2s ease',
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
                                            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                                        >
                                            Join
                                        </button>
                                        <button
                                            onClick={(e) => handleMeetingComplete(meeting.id, e)}
                                            style={{
                                                flex: 1,
                                                padding: '0.4rem',
                                                background: 'transparent',
                                                color: 'var(--text-muted)',
                                                border: '1px solid var(--border)',
                                                borderRadius: '6px',
                                                fontSize: '0.7rem',
                                                fontWeight: '600',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease',
                                            }}
                                            onMouseEnter={e => {
                                                e.currentTarget.style.color = 'var(--text)';
                                                e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)';
                                            }}
                                            onMouseLeave={e => {
                                                e.currentTarget.style.color = 'var(--text-muted)';
                                                e.currentTarget.style.borderColor = 'var(--border)';
                                            }}
                                        >
                                            Done
                                        </button>
                                    </div>
                                </>
                            )}

                            {/* Collapsed view - just show dot indicator */}
                            {collapsed && !isMobile && (
                                <div style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: 'var(--primary)',
                                    margin: '0 auto',
                                }} />
                            )}
                        </div>
                    ))}

                    {/* Show more indicator */}
                    {meetings.length > 5 && (!collapsed || isMobile) && (
                        <p style={{
                            margin: '0.5rem 0 0',
                            fontSize: '0.7rem',
                            color: 'var(--text-muted)',
                            textAlign: 'center',
                            fontStyle: 'italic',
                        }}>
                            +{meetings.length - 5} more meetings
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default UpcomingMeetings;
