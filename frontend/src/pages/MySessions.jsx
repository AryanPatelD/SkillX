import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Check, X, Clock, Calendar, BookOpen, Video, AlertCircle, Coins } from 'lucide-react';

const MySessions = () => {
    const [activeTab, setActiveTab] = useState('teaching'); // 'teaching' or 'learning'
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [myBookings, setMyBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        setLoading(true);
        try {
            const [incomingRes, bookingsRes] = await Promise.all([
                api.get('/sessions/incoming'),
                api.get('/sessions/my-bookings')
            ]);
            setIncomingRequests(incomingRes.data);
            setMyBookings(bookingsRes.data);
        } catch (error) {
            console.error('Error fetching sessions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            await api.put(`/sessions/${id}/status`, { status });
            fetchSessions();
        } catch (error) {
            console.error(`Error updating status to ${status}:`, error);
        }
    };

    const renderSessionList = (sessions, isTeaching) => {
        if (sessions.length === 0) {
            return (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    <p>No {isTeaching ? 'teaching' : 'learning'} sessions found.</p>
                </div>
            );
        }

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {sessions.map(session => (
                    <div key={session.id} className="card" style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <BookOpen size={20} color="#4f46e5" />
                                    {session.skill.name} Session
                                </h3>
                                <p style={{ color: '#64748b', marginBottom: '0.5rem' }}>
                                    {isTeaching ? (
                                        <>Request from: <span style={{ fontWeight: '600', color: '#0f172a' }}>{session.requester.full_name}</span></>
                                    ) : (
                                        <>Tutor: <span style={{ fontWeight: '600', color: '#0f172a' }}>{session.provider.full_name}</span></>
                                    )}
                                </p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', color: '#64748b', fontSize: '0.875rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Calendar size={16} />
                                        <span>{new Date(session.scheduled_time).toLocaleDateString()}</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Clock size={16} />
                                        <span>{new Date(session.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    {session.meeting_link && (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Video size={16} />
                                            <a href={session.meeting_link.startsWith('http') ? session.meeting_link : `https://${session.meeting_link}`} target="_blank" rel="noopener noreferrer" style={{ color: '#4f46e5' }}>Meeting Link</a>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <span style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '1rem',
                                fontSize: '0.875rem',
                                fontWeight: 'bold',
                                background: session.status === 'Pending' ? '#fef3c7' : session.status === 'Confirmed' ? '#dcfce7' : '#fee2e2',
                                color: session.status === 'Pending' ? '#d97706' : session.status === 'Confirmed' ? '#166534' : '#991b1b'
                            }}>
                                {session.status}
                            </span>
                        </div>

                        {/* Actions for Teacher */}
                        {isTeaching && session.status === 'Pending' && (
                            <>
                                <div style={{
                                    marginTop: '1rem',
                                    padding: '0.75rem',
                                    background: '#f0fdf4',
                                    border: '1px solid #86efac',
                                    borderRadius: '0.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontSize: '0.85rem',
                                    color: '#166534'
                                }}>
                                    <Coins size={16} />
                                    <span>You'll receive <strong>5 credits</strong> when you accept this session</span>
                                </div>
                                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                                    <button
                                        onClick={() => handleStatusUpdate(session.id, 'Confirmed')}
                                        className="btn-primary"
                                        style={{ background: '#22c55e', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                                    >
                                        <Check size={16} style={{ marginRight: '0.25rem' }} /> Accept
                                    </button>
                                    <button
                                        onClick={() => handleStatusUpdate(session.id, 'Cancelled')}
                                        className="btn-primary"
                                        style={{ background: '#ef4444', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                                    >
                                        <X size={16} style={{ marginRight: '0.25rem' }} /> Reject
                                    </button>
                                </div>
                            </>
                        )}
                        
                        {/* Info for Learner */}
                        {!isTeaching && session.status === 'Pending' && (
                            <div style={{
                                marginTop: '1rem',
                                padding: '0.75rem',
                                background: '#fef3c7',
                                border: '1px solid #fcd34d',
                                borderRadius: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.85rem',
                                color: '#92400e'
                            }}>
                                <AlertCircle size={16} />
                                <span><strong>5 credits</strong> will be deducted when the tutor accepts</span>
                            </div>
                        )}
                        
                        {!isTeaching && session.status === 'Confirmed' && (
                            <div style={{
                                marginTop: '1rem',
                                padding: '0.75rem',
                                background: '#fee2e2',
                                border: '1px solid #fecaca',
                                borderRadius: '0.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                fontSize: '0.85rem',
                                color: '#991b1b'
                            }}>
                                <Coins size={16} />
                                <span><strong>5 credits</strong> have been deducted from your account</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="hub-container" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>My Sessions</h1>

            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    onClick={() => setActiveTab('teaching')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        borderRadius: '0.5rem',
                        border: 'none',
                        background: activeTab === 'teaching' ? '#4f46e5' : '#e2e8f0',
                        color: activeTab === 'teaching' ? 'white' : '#475569',
                        cursor: 'pointer',
                        fontWeight: '600',
                        flex: 1
                    }}
                >
                    Teaching (Incoming)
                </button>
                <button
                    onClick={() => setActiveTab('learning')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        borderRadius: '0.5rem',
                        border: 'none',
                        background: activeTab === 'learning' ? '#4f46e5' : '#e2e8f0',
                        color: activeTab === 'learning' ? 'white' : '#475569',
                        cursor: 'pointer',
                        fontWeight: '600',
                        flex: 1
                    }}
                >
                    Learning (My Bookings)
                </button>
            </div>

            {loading ? (
                <div>Loading sessions...</div>
            ) : (
                activeTab === 'teaching'
                    ? renderSessionList(incomingRequests, true)
                    : renderSessionList(myBookings, false)
            )}
        </div>
    );
};

export default MySessions;
