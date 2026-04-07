import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';
import { Check, X, Clock, Calendar, BookOpen, Video, AlertCircle, Coins, User } from 'lucide-react';

const MySessions = () => {
    const { socket, connected } = useSocket();
    const { user, loading: authLoading } = useAuth();
    const [activeTab, setActiveTab] = useState('teaching'); // 'teaching' or 'tutor-offers'
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [pendingOffers, setPendingOffers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmationModal, setConfirmationModal] = useState({ isOpen: false, session: null });
    const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

    useEffect(() => {
        if (!authLoading && user) {
            fetchSessions();
        } else if (!authLoading && !user) {
            setLoading(false);
            showAlert('Please login to view sessions', 'error');
        }
    }, [authLoading, user]);

    const showAlert = (message, type = 'success') => {
        setAlert({ show: true, message, type });
        setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 3000);
    };

    // Listen for real-time session updates
    useEffect(() => {
        if (!socket) return;

        const handleSessionCreated = () => {
            console.log('🔔 New session created');
            fetchSessions();
        };

        const handleSessionStatusUpdated = () => {
            console.log('🔔 Session status updated by another user');
            fetchSessions();
        };

        socket.on('sessionCreated', handleSessionCreated);
        socket.on('sessionStatusUpdated', handleSessionStatusUpdated);

        return () => {
            socket.off('sessionCreated', handleSessionCreated);
            socket.off('sessionStatusUpdated', handleSessionStatusUpdated);
        };
    }, [socket]);

    const fetchSessions = async () => {
        setLoading(true);
        try {
            const [incomingRes, offersRes] = await Promise.all([
                api.get('/sessions/incoming'),
                api.get('/sessions/pending-offers')
            ]);
            setIncomingRequests(incomingRes.data);
            setPendingOffers(offersRes.data);
        } catch (error) {
            console.error('Error fetching sessions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            // Immediately remove cancelled/rejected sessions from UI
            if (status === 'Cancelled') {
                setIncomingRequests(prev => prev.filter(s => s.id !== id));
                setPendingOffers(prev => prev.filter(s => s.id !== id));
                showAlert('Offer declined successfully', 'success');
            }
            
            await api.put(`/sessions/${id}/status`, { status });
            
            if (status === 'Confirmed') {
                showAlert('Session confirmed successfully', 'success');
            } else if (status === 'Completed') {
                showAlert('Session marked as completed', 'success');
            }
            
            // Refresh all sessions to stay in sync
            fetchSessions();
        } catch (error) {
            console.error(`Error updating status to ${status}:`, error);
            showAlert(error.response?.data?.message || `Failed to update session`, 'error');
            // Refresh to restore session if cancel failed
            fetchSessions();
        }
    };

    const handleConfirmSession = async (sessionId, scheduledTime) => {
        try {
            await api.put(`/sessions/${sessionId}/confirm`, { scheduled_time: scheduledTime });
            showAlert('Session confirmed and time scheduled successfully', 'success');
            fetchSessions();
            setConfirmationModal({ isOpen: false, session: null });
        } catch (error) {
            console.error('Error confirming session:', error);
            showAlert(error.response?.data?.message || 'Failed to confirm session', 'error');
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
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', color: '#64748b', fontSize: '0.875rem', flexWrap: 'wrap' }}>
                                    {session.scheduled_time && (
                                        <>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Calendar size={16} />
                                                <span>{new Date(session.scheduled_time).toLocaleDateString()}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Clock size={16} />
                                                <span>
                                                    {new Date(session.scheduled_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(new Date(session.scheduled_time).getTime() + 60 * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                    {!session.scheduled_time && session.provider_available_from && (
                                        <>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b' }}>
                                                <Calendar size={16} />
                                                <span><strong>Available:</strong> {new Date(session.provider_available_from).toLocaleDateString()} to {new Date(session.provider_available_to).toLocaleDateString()}</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b' }}>
                                                <Clock size={16} />
                                                <span>{new Date(session.provider_available_from).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(session.provider_available_to).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </>
                                    )}
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
                            <>
                                <div style={{
                                    marginTop: '1rem',
                                    padding: '0.75rem',
                                    background: session.scheduled_time ? '#fef3c7' : '#fef3c7',
                                    border: '1px solid #fcd34d',
                                    borderRadius: '0.5rem',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    fontSize: '0.85rem',
                                    color: '#92400e'
                                }}>
                                    <AlertCircle size={16} />
                                    <span>{session.scheduled_time ? <><strong>5 credits</strong> will be deducted when you confirm</> : <>Please confirm a time within the tutor's availability window</>}</span>
                                </div>
                                {!session.scheduled_time && (
                                    <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                                        <button
                                            onClick={() => setConfirmationModal({ isOpen: true, session })}
                                            style={{
                                                background: '#4f46e5',
                                                color: 'white',
                                                padding: '0.5rem 1rem',
                                                fontSize: '0.875rem',
                                                border: 'none',
                                                borderRadius: '0.5rem',
                                                cursor: 'pointer',
                                                fontWeight: '600',
                                                flex: 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: '0.5rem'
                                            }}
                                        >
                                            <Check size={16} /> Confirm Time
                                        </button>
                                    </div>
                                )}
                            </>
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

    const renderPendingOffers = () => {
        if (pendingOffers.length === 0) {
            return (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    <p>No pending tutor offers.</p>
                </div>
            );
        }

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {pendingOffers.map(offer => (
                    <div key={offer.id} className="card" style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <BookOpen size={20} color="#4f46e5" />
                                    {offer.skill.name} Session
                                </h3>
                                <p style={{ color: '#64748b', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <User size={16} />
                                    <span>Tutor: <span style={{ fontWeight: '600', color: '#0f172a' }}>{offer.provider.full_name}</span></span>
                                </p>
                            </div>
                            <span style={{
                                padding: '0.25rem 0.75rem',
                                borderRadius: '1rem',
                                fontSize: '0.875rem',
                                fontWeight: 'bold',
                                background: '#fef3c7',
                                color: '#d97706'
                            }}>
                                Pending Your Choice
                            </span>
                        </div>

                        {/* Request Description */}
                        {offer.skillRequest && (
                            <div style={{
                                marginBottom: '1rem',
                                padding: '0.75rem',
                                background: '#f0f9ff',
                                border: '1px solid #bfdbfe',
                                borderRadius: '0.5rem',
                                fontSize: '0.875rem',
                                color: '#064e3b'
                            }}>
                                <p style={{ margin: 0, fontWeight: '500', marginBottom: '0.25rem' }}>Your Request:</p>
                                <p style={{ margin: 0, color: '#1e293b' }}>{offer.skillRequest.description}</p>
                            </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', color: '#64748b', fontSize: '0.875rem', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b' }}>
                                <Calendar size={16} />
                                <span><strong>Available:</strong> {new Date(offer.provider_available_from).toLocaleDateString()} to {new Date(offer.provider_available_to).toLocaleDateString()}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#f59e0b' }}>
                                <Clock size={16} />
                                <span>{new Date(offer.provider_available_from).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(offer.provider_available_to).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div>

                        <div style={{
                            marginTop: '1rem',
                            padding: '0.75rem',
                            background: '#dcfce7',
                            border: '1px solid #86efac',
                            borderRadius: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.85rem',
                            color: '#166534'
                        }}>
                            <Coins size={16} />
                            <span>You will spend <strong>5 credits</strong> when you accept</span>
                        </div>

                        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                            <button
                                onClick={() => setConfirmationModal({ isOpen: true, session: offer })}
                                className="btn-primary"
                                style={{ background: '#22c55e', padding: '0.5rem 1rem', fontSize: '0.875rem', flex: 1 }}
                            >
                                <Check size={16} style={{ marginRight: '0.25rem' }} /> Accept Offer
                            </button>
                            <button
                                onClick={() => handleStatusUpdate(offer.id, 'Cancelled')}
                                className="btn-primary"
                                style={{ background: '#ef4444', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                            >
                                <X size={16} style={{ marginRight: '0.25rem' }} /> Decline
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    // Check authentication before rendering
    if (authLoading) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                Loading...
            </div>
        );
    }

    if (!user) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center', color: '#991b1b', background: '#fee2e2', borderRadius: '0.5rem', margin: '1rem' }}>
                <p style={{ fontSize: '1.125rem', fontWeight: '600' }}>⚠️ Access Denied</p>
                <p>Please log in to view your sessions.</p>
            </div>
        );
    }

    return (
        <div className="hub-container" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            {/* Alert Notification */}
            {alert.show && (
                <div style={{
                    position: 'fixed',
                    bottom: '1.5rem',
                    right: '1.5rem',
                    padding: '1rem 1.5rem',
                    borderRadius: '0.5rem',
                    background: alert.type === 'success' ? '#dcfce7' : '#fee2e2',
                    border: `2px solid ${alert.type === 'success' ? '#86efac' : '#fecaca'}`,
                    color: alert.type === 'success' ? '#166534' : '#991b1b',
                    fontWeight: '600',
                    zIndex: 2000,
                    animation: 'slideInUp 0.3s ease-out',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    maxWidth: '350px',
                    wordWrap: 'break-word'
                }}>
                    {alert.message}
                </div>
            )}
            
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
                    onClick={() => setActiveTab('tutor-offers')}
                    style={{
                        padding: '0.75rem 1.5rem',
                        borderRadius: '0.5rem',
                        border: 'none',
                        background: activeTab === 'tutor-offers' ? '#4f46e5' : '#e2e8f0',
                        color: activeTab === 'tutor-offers' ? 'white' : '#475569',
                        cursor: 'pointer',
                        fontWeight: '600',
                        flex: 1
                    }}
                >
                    Tutor Offers ({pendingOffers.length})
                </button>
            </div>

            {loading ? (
                <div>Loading sessions...</div>
            ) : (
                activeTab === 'teaching'
                    ? renderSessionList(incomingRequests, true)
                    : renderPendingOffers()
            )}

            {/* Confirmation Modal */}
            {confirmationModal.isOpen && confirmationModal.session && (
                <ConfirmationModal
                    session={confirmationModal.session}
                    onClose={() => setConfirmationModal({ isOpen: false, session: null })}
                    onConfirm={handleConfirmSession}
                />
            )}
        </div>
    );
};

// Confirmation Modal Component
const ConfirmationModal = ({ session, onClose, onConfirm }) => {
    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [loading, setLoading] = useState(false);

    const fromDate = new Date(session.provider_available_from);
    const toDate = new Date(session.provider_available_to);
    const minDate = fromDate.toISOString().split('T')[0];
    const maxDate = toDate.toISOString().split('T')[0];

    const handleConfirm = async () => {
        if (!selectedDate || !selectedTime) {
            alert('Please select both date and time');
            return;
        }

        const scheduledTime = new Date(`${selectedDate}T${selectedTime}`);
        
        if (scheduledTime < fromDate || scheduledTime > toDate) {
            alert('Selected time must be within the tutor\'s availability window');
            return;
        }

        setLoading(true);
        await onConfirm(session.id, scheduledTime.toISOString());
        setLoading(false);
    };

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)',
            padding: '1rem',
        }}>
            <div style={{
                background: 'white',
                borderRadius: '1.25rem',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                maxWidth: '500px',
                width: '100%',
                padding: '2rem',
            }}>
                <h2 style={{ margin: '0 0 1rem', fontSize: '1.5rem', fontWeight: 'bold' }}>Confirm Meeting Time</h2>
                
                <div style={{
                    background: '#f0f9ff',
                    border: '1px solid #bae6fd',
                    borderRadius: '0.75rem',
                    padding: '1rem',
                    marginBottom: '1.5rem',
                }}>
                    <p style={{ margin: '0 0 0.5rem', fontSize: '0.9rem', color: '#0c4a6e', fontWeight: '600' }}>
                        <strong>Tutor Availability:</strong>
                    </p>
                    <p style={{ margin: '0', fontSize: '0.85rem', color: '#0c4a6e' }}>
                        {fromDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} to {toDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#0c4a6e' }}>
                        {fromDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} to {toDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#1e293b' }}>
                        Select Date <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={minDate}
                        max={maxDate}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '0.75rem',
                            border: '2px solid #e2e8f0',
                            fontSize: '0.95rem',
                            fontFamily: 'inherit',
                            cursor: 'pointer',
                            boxSizing: 'border-box',
                        }}
                    />
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#1e293b' }}>
                        Select Time <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                        type="time"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '0.75rem',
                            border: '2px solid #e2e8f0',
                            fontSize: '0.95rem',
                            fontFamily: 'inherit',
                            cursor: 'pointer',
                            boxSizing: 'border-box',
                        }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        onClick={onClose}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            background: '#e2e8f0',
                            border: 'none',
                            borderRadius: '0.75rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            color: '#475569',
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={loading}
                        style={{
                            flex: 1,
                            padding: '0.75rem',
                            background: '#4f46e5',
                            color: 'white',
                            border: 'none',
                            borderRadius: '0.75rem',
                            fontWeight: '600',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.8 : 1,
                        }}
                    >
                        {loading ? 'Confirming...' : 'Confirm Time'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default MySessions;
