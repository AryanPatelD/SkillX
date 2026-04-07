import React, { useState } from 'react';
import { X, Calendar, Clock, Send, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../services/api';

const OfferHelpModal = ({ request, skill, isOpen, onClose, onSuccess }) => {
    const [availableFromDate, setAvailableFromDate] = useState('');
    const [availableFromTime, setAvailableFromTime] = useState('');
    const [availableToDate, setAvailableToDate] = useState('');
    const [availableToTime, setAvailableToTime] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Get minimum date in YYYY-MM-DD format
    const getMinDate = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Get minimum time in HH:MM format for today
    const getMinTime = (dateValue) => {
        if (dateValue === getMinDate()) {
            const now = new Date();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            return `${hours}:${minutes}`;
        }
        return '00:00';
    };

    // Get minimum date for "Can Teach Until" - should be same as "Can Teach From" date or today
    const getMinDateForEnd = () => {
        return availableFromDate || getMinDate();
    };

    // Get minimum time for "Can Teach Until" - if same date as start, use start time; otherwise 00:00
    const getMinTimeForEnd = () => {
        if (!availableToDate) return '00:00';
        if (availableToDate === availableFromDate && availableFromTime) {
            return availableFromTime;
        }
        return '00:00';
    };

    // Convert 24-hour time to 12-hour format with AM/PM
    const formatTime12Hour = (time24) => {
        if (!time24) return 'Select time';
        const [hours, minutes] = time24.split(':');
        let hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12;
        hour = hour ? hour : 12;
        return `${String(hour).padStart(2, '0')}:${minutes} ${ampm}`;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!availableFromDate || !availableFromTime || !availableToDate || !availableToTime) {
            setError('Please select both start and end dates with times');
            setLoading(false);
            return;
        }

        const availableFrom = `${availableFromDate}T${availableFromTime}`;
        const availableTo = `${availableToDate}T${availableToTime}`;

        const fromDate = new Date(availableFrom);
        const toDate = new Date(availableTo);
        const now = new Date();

        if (fromDate < now) {
            setError('Start time cannot be in the past. Please select a future date and time.');
            setLoading(false);
            return;
        }

        if (toDate <= fromDate) {
            setError('End time must be after start time');
            setLoading(false);
            return;
        }

        try {
            const response = await api.post('/sessions', {
                requestId: request.id,
                provider_available_from: availableFrom,
                provider_available_to: availableTo,
            });
            
            // Show success state
            setSuccess(true);
            setLoading(false);
            
            // Auto-close and refresh after 2 seconds
            setTimeout(() => {
                onSuccess();
                onClose();
                setSuccess(false);
            }, 2000);
        } catch (err) {
            console.error('Error creating session:', err);
            setError(err.response?.data?.message || 'Failed to offer help. Please try again.');
            setLoading(false);
        }
    };

    if (!isOpen) return null;

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
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                maxWidth: '500px',
                width: '100%',
                maxHeight: '90vh',
                overflowY: 'auto',
                animation: 'slideUp 0.3s ease-out',
            }}>
                {/* Header */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '1.25rem 1.5rem',
                    borderBottom: '1px solid #e2e8f0',
                    flexWrap: 'wrap',
                    gap: '1rem',
                }}>
                    <h2 style={{ margin: 0, fontSize: 'clamp(1rem, 5vw, 1.3rem)', fontWeight: '700' }}>Offer to Help</h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#64748b',
                            borderRadius: '0.5rem',
                            transition: 'all 0.2s',
                        }}
                        onMouseEnter={(e) => {
                            e.target.style.background = '#f1f5f9';
                            e.target.style.color = '#1e293b';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = 'none';
                            e.target.style.color = '#64748b';
                        }}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: 'clamp(1rem, 4vw, 1.5rem)' }}>
                    {/* Success Message */}
                    {success && (
                        <div style={{
                            background: '#f0fdf4',
                            border: '1px solid #bbf7d0',
                            borderRadius: '0.75rem',
                            padding: '1rem',
                            marginBottom: '1.5rem',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.75rem',
                            animation: 'slideDown 0.3s ease-out',
                        }}>
                            <CheckCircle size={24} style={{ color: '#10b981', flexShrink: 0, marginTop: '0.25rem' }} />
                            <div>
                                <p style={{ margin: '0 0 0.5rem', fontSize: '0.95rem', fontWeight: '600', color: '#15803d' }}>
                                    ✨ Help Offer Sent!
                                </p>
                                <p style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: '#047857', lineHeight: '1.4' }}>
                                    <strong>Status: Waiting for Learner Confirmation</strong>
                                </p>
                                <p style={{ margin: '0', fontSize: '0.85rem', color: '#047857', lineHeight: '1.4' }}>
                                    The learner will review your availability. Once they confirm, the session will appear in <strong>My Sessions</strong> and you'll be able to see the confirmed meeting details.
                                </p>
                            </div>
                        </div>
                    )}

                    {!success && (
                    <>
                    {/* Learner's Request */}
                    <div style={{
                        background: '#f0f9ff',
                        border: '1px solid #bae6fd',
                        borderRadius: '0.75rem',
                        padding: 'clamp(0.875rem, 3vw, 1.25rem)',
                        marginBottom: '1.5rem',
                    }}>
                        <p style={{ margin: '0 0 0.75rem', fontSize: 'clamp(0.75rem, 2vw, 0.85rem)', fontWeight: '600', color: '#0369a1', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Learner's Request
                        </p>
                        <p style={{ margin: '0 0 1rem', fontSize: 'clamp(0.9rem, 3vw, 1rem)', fontWeight: '600', color: '#1e293b' }}>
                            {request.description}
                        </p>
                        {skill && (
                            <p style={{ margin: '0.5rem 0', fontSize: 'clamp(0.8rem, 2vw, 0.875rem)', color: '#0c4a6e' }}>
                                <strong>Skill:</strong> {skill.name}
                            </p>
                        )}
                        {request.deadline && (
                            <p style={{ margin: '0.5rem 0', fontSize: 'clamp(0.8rem, 2vw, 0.875rem)', color: '#0c4a6e', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <Calendar size={14} />
                                <strong>Deadline:</strong> {new Date(request.deadline).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </p>
                        )}
                    </div>

                    {/* Your Availability */}
                    {error && (
                        <div style={{
                            background: '#fef2f2',
                            border: '1px solid #fecaca',
                            color: '#dc2626',
                            padding: 'clamp(0.7rem, 2vw, 0.875rem)',
                            borderRadius: '0.75rem',
                            marginBottom: '1rem',
                            fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                        }}>
                            ⚠️ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                            <p style={{ margin: '0 0 0.75rem', fontSize: 'clamp(0.75rem, 2vw, 0.85rem)', fontWeight: '600', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Your Availability
                            </p>
                        </div>

                        <div>
                            <label style={{
                                display: 'block',
                                fontWeight: '600',
                                fontSize: 'clamp(0.85rem, 2vw, 0.9rem)',
                                marginBottom: '0.5rem',
                                color: '#1e293b',
                            }}>
                                Can Teach From <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <div style={{ flex: 1 }}>
                                    <input
                                        type="date"
                                        value={availableFromDate}
                                        onChange={(e) => setAvailableFromDate(e.target.value)}
                                        min={getMinDate()}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            borderRadius: '0.75rem',
                                            border: '2px solid #e2e8f0',
                                            fontSize: '0.95rem',
                                            fontFamily: 'inherit',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s',
                                            boxSizing: 'border-box',
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = '#6366f1';
                                            e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#e2e8f0';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                        required
                                    />
                                    <p style={{ margin: '0.3rem 0 0', fontSize: '0.7rem', color: '#64748b' }}>Date</p>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <input
                                        type="time"
                                        value={availableFromTime}
                                        onChange={(e) => setAvailableFromTime(e.target.value)}
                                        min={getMinTime(availableFromDate)}
                                        disabled={!availableFromDate}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            borderRadius: '0.75rem',
                                            border: '2px solid #e2e8f0',
                                            fontSize: '0.95rem',
                                            fontFamily: 'inherit',
                                            cursor: availableFromDate ? 'pointer' : 'not-allowed',
                                            transition: 'all 0.2s',
                                            boxSizing: 'border-box',
                                            opacity: !availableFromDate ? 0.5 : 1,
                                        }}
                                        onFocus={(e) => {
                                            if (availableFromDate) {
                                                e.target.style.borderColor = '#6366f1';
                                                e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                                            }
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#e2e8f0';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                        required
                                    />
                                    <p style={{ margin: '0.3rem 0 0', fontSize: '0.7rem', color: '#64748b' }}>
                                        {availableFromTime ? formatTime12Hour(availableFromTime) : 'Time'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label style={{
                                display: 'block',
                                fontWeight: '600',
                                fontSize: 'clamp(0.85rem, 2vw, 0.9rem)',
                                marginBottom: '0.5rem',
                                color: '#1e293b',
                            }}>
                                Can Teach Until <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <div style={{ display: 'flex', gap: '0.75rem' }}>
                                <div style={{ flex: 1 }}>
                                    <input
                                        type="date"
                                        value={availableToDate}
                                        onChange={(e) => setAvailableToDate(e.target.value)}
                                        min={getMinDateForEnd()}
                                        disabled={!availableFromDate}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            borderRadius: '0.75rem',
                                            border: '2px solid #e2e8f0',
                                            fontSize: '0.95rem',
                                            fontFamily: 'inherit',
                                            cursor: availableFromDate ? 'pointer' : 'not-allowed',
                                            transition: 'all 0.2s',
                                            boxSizing: 'border-box',
                                            opacity: !availableFromDate ? 0.5 : 1,
                                        }}
                                        onFocus={(e) => {
                                            if (availableFromDate) {
                                                e.target.style.borderColor = '#6366f1';
                                                e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                                            }
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#e2e8f0';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                        required
                                    />
                                    <p style={{ margin: '0.3rem 0 0', fontSize: '0.7rem', color: '#64748b' }}>Date</p>
                                </div>
                                <div style={{ flex: 1 }}>
                                    <input
                                        type="time"
                                        value={availableToTime}
                                        onChange={(e) => setAvailableToTime(e.target.value)}
                                        min={getMinTimeForEnd()}
                                        disabled={!availableToDate}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            borderRadius: '0.75rem',
                                            border: '2px solid #e2e8f0',
                                            fontSize: '0.95rem',
                                            fontFamily: 'inherit',
                                            cursor: availableToDate ? 'pointer' : 'not-allowed',
                                            transition: 'all 0.2s',
                                            boxSizing: 'border-box',
                                            opacity: !availableToDate ? 0.5 : 1,
                                        }}
                                        onFocus={(e) => {
                                            if (availableToDate) {
                                                e.target.style.borderColor = '#6366f1';
                                                e.target.style.boxShadow = '0 0 0 3px rgba(99, 102, 241, 0.1)';
                                            }
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = '#e2e8f0';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                        required
                                    />
                                    <p style={{ margin: '0.3rem 0 0', fontSize: '0.7rem', color: '#64748b' }}>
                                        {availableToTime ? formatTime12Hour(availableToTime) : 'Time'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                color: 'white',
                                border: 'none',
                                padding: 'clamp(0.7rem, 3vw, 0.875rem) clamp(1rem, 4vw, 1.5rem)',
                                borderRadius: '0.75rem',
                                fontWeight: '700',
                                fontSize: 'clamp(0.85rem, 3vw, 0.95rem)',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                                opacity: loading ? 0.8 : 1,
                                boxShadow: '0 4px 6px -1px rgba(99, 102, 241, 0.4)',
                                width: '100%',
                            }}
                            onMouseEnter={(e) => !loading && (e.target.style.transform = 'translateY(-2px)', e.target.style.boxShadow = '0 6px 8px -1px rgba(99, 102, 241, 0.5)')}
                            onMouseLeave={(e) => (e.target.style.transform = 'translateY(0)', e.target.style.boxShadow = '0 4px 6px -1px rgba(99, 102, 241, 0.4)')}
                        >
                            {loading ? '⏳ Confirming...' : (
                                <>
                                    <Send size={18} />
                                    Offer to Help
                                </>
                            )}
                        </button>
                    </form>
                    </>
                    )}
                </div>

                <style>{`
                    @keyframes slideUp {
                        from {
                            opacity: 0;
                            transform: translateY(20px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                    
                    @keyframes slideDown {
                        from {
                            opacity: 0;
                            transform: translateY(-10px);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                    
                    @media (max-width: 640px) {
                        input[type="datetime-local"] {
                            font-size: 16px !important;
                        }
                    }
                `}</style>
            </div>
        </div>
    );
};

export default OfferHelpModal;
