import React, { useState } from 'react';
import api from '../services/api';
import './FeedbackForm.css';

const FeedbackForm = ({ sessionId, toUserId, feedbackType, onClose, onSuccess }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [creditsInfo, setCreditsInfo] = useState(null);

    const feedbackLabels = {
        tutor_to_learner: 'Learner Feedback',
        learner_to_tutor: 'Tutor Feedback',
    };

    const feedbackPrompts = {
        tutor_to_learner: [
            'How well did the learner grasp the concepts?',
            'Was the learner engaged and attentive?',
            'Did the learner ask thoughtful questions?',
            'How was the learner\'s behavior and professionalism?',
        ],
        learner_to_tutor: [
            'How clear was the tutor\'s explanation?',
            'Was the tutor patient and supportive?',
            'Did the tutor adapt to your learning pace?',
            'How effective was the teaching method?',
        ],
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (rating === 0) {
            setError('Please provide a rating');
            setLoading(false);
            return;
        }

        try {
            const response = await api.post(
                '/feedback/submit',
                {
                    sessionId,
                    toUserId,
                    feedbackType,
                    rating,
                    comment,
                },
                
            );

            setSuccess(true);
            setRating(0);
            setComment('');
            if (response.data.credits) {
                setCreditsInfo(response.data.credits);
            }
            if (onSuccess) {
                onSuccess(response.data);
            }
            setTimeout(() => {
                if (onClose) {
                    onClose();
                }
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Error submitting feedback');
        } finally {
            setLoading(false);
        }
    };

    // Inline styles object
    const stylesObj = {
        backdrop: {
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: '1rem',
            animation: 'fadeIn 0.3s ease-out',
        },
        modal: {
            backgroundColor: 'white',
            borderRadius: '1rem',
            padding: '2rem',
            maxWidth: '28rem',
            width: '100%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            animation: 'fadeIn 0.3s ease-out',
            maxHeight: '90vh',
            overflowY: 'auto',
        },
        header: {
            marginBottom: '2rem',
        },
        iconCircle: {
            display: 'inline-block',
            padding: '0.75rem',
            backgroundColor: '#e0f2fe',
            borderRadius: '50%',
            marginBottom: '1rem',
            fontSize: '1.5rem',
        },
        title: {
            fontSize: '1.875rem',
            fontWeight: 'bold',
            background: 'linear-gradient(to right, rgb(37, 99, 235), rgb(168, 85, 247))',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            marginBottom: '0.5rem',
        },
        subtitle: {
            color: '#4b5563',
            fontSize: '0.875rem',
            lineHeight: '1.5',
        },
        successContainer: {
            textAlign: 'center',
            padding: '3rem 0',
        },
        successEmoji: {
            marginBottom: '1rem',
            fontSize: '3.75rem',
            animation: 'bounce 1s infinite',
        },
        successText: {
            color: '#16a34a',
            fontWeight: 'bold',
            fontSize: '1.125rem',
        },
        redirectingText: {
            color: '#6b7280',
            fontSize: '0.875rem',
            marginTop: '0.5rem',
        },
        creditsInfoBox: {
            backgroundColor: '#f0fdf4',
            border: '2px solid #86efac',
            borderRadius: '0.75rem',
            padding: '1rem',
            marginTop: '1rem',
            textAlign: 'center',
        },
        form: {
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem',
        },
        ratingSection: {
            background: 'linear-gradient(to bottom right, rgb(240, 249, 255), rgb(243, 232, 255))',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            border: '1px solid rgb(191, 219, 254)',
        },
        label: {
            display: 'block',
            color: '#374151',
            fontWeight: 'bold',
            marginBottom: '1rem',
            fontSize: '1.125rem',
        },
        starsContainer: {
            display: 'flex',
            gap: '0.75rem',
            justifyContent: 'center',
            marginBottom: '1rem',
        },
        starButton: {
            fontSize: '3rem',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            transition: 'all 200ms ease',
            padding: 0,
        },
        ratingLabel: {
            textAlign: 'center',
        },
        ratingValue: {
            fontSize: '0.875rem',
            fontWeight: '600',
            color: '#2563eb',
        },
        ratingText: {
            color: '#374151',
        },
        commentSection: {},
        promptBox: {
            backgroundColor: '#f0f9ff',
            border: '2px solid rgb(191, 219, 254)',
            borderRadius: '0.75rem',
            padding: '1rem',
            marginBottom: '1rem',
        },
        promptTitle: {
            fontSize: '0.75rem',
            fontWeight: '600',
            color: '#1e3a8a',
            marginBottom: '0.5rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
        },
        promptList: {
            listStyle: 'none',
            padding: 0,
            margin: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
        },
        promptItem: {
            display: 'flex',
            alignItems: 'flex-start',
            fontSize: '0.75rem',
            color: '#1e40af',
            gap: '0.5rem',
        },
        promptCheck: {
            color: '#3b82f6',
            fontWeight: 'bold',
            minWidth: 'fit-content',
        },
        textarea: {
            width: '100%',
            padding: '0.75rem 1rem',
            border: '2px solid #d1d5db',
            borderRadius: '0.75rem',
            fontFamily: 'inherit',
            resize: 'none',
            fontSize: '1rem',
            boxSizing: 'border-box',
        },
        charCount: {
            fontSize: '0.75rem',
            color: '#9ca3af',
            marginTop: '0.5rem',
        },
        errorBox: {
            backgroundColor: '#fef2f2',
            border: '2px solid #fecaca',
            color: '#dc2626',
            padding: '1rem',
            borderRadius: '0.75rem',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.5rem',
        },
        errorIcon: {
            fontSize: '1.125rem',
        },
        buttonContainer: {
            display: 'flex',
            gap: '0.75rem',
            paddingTop: '1rem',
        },
        cancelBtn: {
            flex: 1,
            padding: '0.75rem 1rem',
            backgroundColor: '#e5e7eb',
            color: '#1f2937',
            borderRadius: '0.75rem',
            fontWeight: 'bold',
            border: 'none',
            transition: 'all 200ms ease',
            cursor: 'pointer',
            transform: 'scale(1)',
        },
        submitBtn: {
            flex: 1,
            padding: '0.75rem 1rem',
            background: 'linear-gradient(to right, rgb(37, 99, 235), rgb(168, 85, 247))',
            color: 'white',
            borderRadius: '0.75rem',
            fontWeight: 'bold',
            border: 'none',
            transition: 'all 200ms ease',
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)',
            transform: 'scale(1)',
        },
        disclaimer: {
            fontSize: '0.75rem',
            textAlign: 'center',
            color: '#6b7280',
            marginTop: '1rem',
        },
    };

    return (
        <div style={stylesObj.backdrop}>
            <div style={stylesObj.modal} className="feedback-modal">
                <div style={stylesObj.header}>
                    <div style={stylesObj.iconCircle}>⭐</div>
                    <h2 style={stylesObj.title}>{feedbackLabels[feedbackType]}</h2>
                    <p style={stylesObj.subtitle}>Your feedback helps improve the learning experience</p>
                </div>

                {success ? (
                    <div style={stylesObj.successContainer} className="animate-bounce">
                        <div style={stylesObj.successEmoji}>✅</div>
                        <p style={stylesObj.successText}>Thank you for your feedback!</p>
                        {creditsInfo && (
                            <div>
                                <p style={{ ...stylesObj.redirectingText, marginTop: '1rem', color: '#059669' }}>
                                    {creditsInfo.recipientName} received feedback
                                </p>
                                <p style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#2563eb', marginTop: '0.5rem' }}>
                                    {creditsInfo.changed > 0 ? '+' : ''}{creditsInfo.changed} {creditsInfo.changed === 1 || creditsInfo.changed === -1 ? 'point' : 'points'}
                                </p>
                                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.5rem' }}>
                                    Rating: {creditsInfo.ratingLabel}
                                </p>
                                <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '0.25rem' }}>
                                    Total Credits: {creditsInfo.recipientCredits}
                                </p>
                            </div>
                        )}
                        <p style={stylesObj.redirectingText}>Redirecting...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} style={stylesObj.form}>
                        {/* Rating Section */}
                        <div style={stylesObj.ratingSection}>
                            <label style={stylesObj.label}>How would you rate this session?</label>
                            <div style={stylesObj.starsContainer}>
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                        key={star}
                                        type="button"
                                        onClick={() => setRating(star)}
                                        onMouseEnter={() => setHoverRating(star)}
                                        onMouseLeave={() => setHoverRating(0)}
                                        style={{
                                            ...stylesObj.starButton,
                                            color: star <= (hoverRating || rating) ? '#fbbf24' : '#d1d5db',
                                            transform: star <= (hoverRating || rating) ? 'scale(1.2)' : 'scale(1)',
                                            textShadow: star <= (hoverRating || rating) ? '0 0 8px rgba(251, 191, 36, 0.5)' : 'none',
                                        }}
                                    >
                                        ★
                                    </button>
                                ))}
                            </div>
                            {rating > 0 && (
                                <div style={stylesObj.ratingLabel}>
                                    <span style={stylesObj.ratingValue}>{rating}/5 - </span>
                                    <span style={stylesObj.ratingText}>
                                        {['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating - 1]}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Comments Section */}
                        <div style={stylesObj.commentSection}>
                            <label style={stylesObj.label}>Share Your Feedback</label>
                            <div style={stylesObj.promptBox}>
                                <p style={stylesObj.promptTitle}>💡 Consider these points:</p>
                                <ul style={stylesObj.promptList}>
                                    {feedbackPrompts[feedbackType].map((prompt, idx) => (
                                        <li key={idx} style={stylesObj.promptItem}>
                                            <span style={stylesObj.promptCheck}>✓</span>
                                            <span>{prompt}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <textarea
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                                placeholder="Share your thoughts here... (Optional)"
                                style={stylesObj.textarea}
                                rows="4"
                                maxLength={500}
                                onFocus={(e) => {
                                    e.target.style.borderColor = '#3b82f6';
                                    e.target.style.boxShadow = '0 0 0 2px rgb(191, 219, 254)';
                                }}
                                onBlur={(e) => {
                                    e.target.style.borderColor = '#d1d5db';
                                    e.target.style.boxShadow = 'none';
                                }}
                            />
                            <p style={stylesObj.charCount}>{comment.length}/500 characters</p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div style={stylesObj.errorBox}>
                                <span style={stylesObj.errorIcon}>⚠️</span>
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Buttons */}
                        <div style={stylesObj.buttonContainer}>
                            <button
                                type="button"
                                onClick={onClose}
                                style={stylesObj.cancelBtn}
                                onMouseOver={(e) => {
                                    e.target.style.backgroundColor = '#d1d5db';
                                    e.target.style.transform = 'scale(1.05)';
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.backgroundColor = '#e5e7eb';
                                    e.target.style.transform = 'scale(1)';
                                }}
                                onMouseDown={(e) => {
                                    e.target.style.transform = 'scale(0.95)';
                                }}
                                onMouseUp={(e) => {
                                    e.target.style.transform = 'scale(1.05)';
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    ...stylesObj.submitBtn,
                                    opacity: loading ? 0.7 : 1,
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                }}
                                onMouseOver={(e) => {
                                    if (!loading) {
                                        e.target.style.boxShadow = '0 10px 25px rgba(59, 130, 246, 0.4)';
                                        e.target.style.transform = 'scale(1.05)';
                                    }
                                }}
                                onMouseOut={(e) => {
                                    e.target.style.boxShadow = '0 4px 15px rgba(59, 130, 246, 0.3)';
                                    e.target.style.transform = 'scale(1)';
                                }}
                                onMouseDown={(e) => {
                                    if (!loading) {
                                        e.target.style.transform = 'scale(0.95)';
                                    }
                                }}
                                onMouseUp={(e) => {
                                    if (!loading) {
                                        e.target.style.transform = 'scale(1.05)';
                                    }
                                }}
                            >
                                {loading ? '⏳ Submitting...' : '✓ Submit Feedback'}
                            </button>
                        </div>

                        <p style={stylesObj.disclaimer}>Your feedback is anonymous and helps us improve</p>
                    </form>
                )}
            </div>
        </div>
    );
};

export default FeedbackForm;
