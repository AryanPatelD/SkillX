import React, { useState, useEffect } from 'react';
import api from '../services/api';

const UserFeedback = ({ userId, showAll = false }) => {
    const [feedbacks, setFeedbacks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);

    useEffect(() => {
        fetchFeedbacks();
    }, [userId, page]);

    const fetchFeedbacks = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/feedback/received/${userId}`, {
                params: {
                    limit: showAll ? 50 : 5,
                    offset: page * (showAll ? 50 : 5),
                },
            });
            setFeedbacks(response.data.data);
            setError('');
        } catch (err) {
            setError('Failed to load feedback');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const renderStars = (rating) => {
        return [1, 2, 3, 4, 5].map((star) => (
            <span
                key={star}
                className={`text-lg ${
                    star <= rating ? 'text-yellow-400' : 'text-gray-300'
                }`}
            >
                ★
            </span>
        ));
    };

    const getFeedbackTypeLabel = (type) => {
        return type === 'tutor_to_learner'
            ? 'Feedback from Tutor'
            : 'Feedback from Learner';
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="h-20 bg-gray-200 rounded-lg animate-pulse"
                    />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                {error}
            </div>
        );
    }

    if (feedbacks.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">No feedback yet</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                    Recent Feedback ({feedbacks.length})
                </h3>
            </div>

            {feedbacks.map((feedback) => (
                <div
                    key={feedback.id}
                    className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            <p className="font-semibold text-gray-800">
                                {feedback.fromUser?.full_name || 'Anonymous'}
                            </p>
                            <p className="text-xs text-gray-500">
                                {getFeedbackTypeLabel(feedback.feedback_type)}
                            </p>
                        </div>
                        <span className="text-xs text-gray-400">
                            {formatDate(feedback.createdAt)}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                        <div className="flex gap-1">
                            {renderStars(feedback.rating)}
                        </div>
                        <span className="text-sm font-semibold text-gray-700">
                            {feedback.rating}/5
                        </span>
                    </div>

                    {feedback.comment && (
                        <p className="text-gray-600 text-sm">"{feedback.comment}"</p>
                    )}
                </div>
            ))}

            {!showAll && feedbacks.length > 0 && (
                <div className="text-center pt-4">
                    <a
                        href={`/feedback/${userId}`}
                        className="text-blue-600 hover:text-blue-700 text-sm font-semibold"
                    >
                        View All Feedback
                    </a>
                </div>
            )}
        </div>
    );
};

export default UserFeedback;
