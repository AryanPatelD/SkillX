import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../services/api';
import RatingDisplay from '../components/RatingDisplay';

const UserFeedbackPage = () => {
    const { userId } = useParams();
    const [user, setUser] = useState(null);
    const [feedbacks, setFeedbacks] = useState([]);
    const [ratings, setRatings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [page, setPage] = useState(0);
    const [totalFeedbacks, setTotalFeedbacks] = useState(0);

    const itemsPerPage = 10;

    useEffect(() => {
        fetchData();
    }, [userId, page]);

    const fetchData = async () => {
        try {
            setLoading(true);
            
            // Fetch user profile
            const userResponse = await api.get(`/profile/public/${userId}`);
            setUser(userResponse.data);
            setRatings(userResponse.data.ratings);

            // Fetch feedbacks
            const feedbackResponse = await api.get(`/feedback/received/${userId}`, {
                params: {
                    limit: itemsPerPage,
                    offset: page * itemsPerPage,
                },
            });
            setFeedbacks(feedbackResponse.data.data);
            setTotalFeedbacks(feedbackResponse.data.total);
            
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load feedback');
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
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const totalPages = Math.ceil(totalFeedbacks / itemsPerPage);

    if (loading && !user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div
            style={{
                padding: 'clamp(0.75rem, 3%, 1.25rem)',
                maxWidth: '900px',
                margin: '0 auto',
                width: '100%',
                boxSizing: 'border-box',
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
            }}
        >
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <a href="/" className="p-2 hover:bg-gray-100 rounded-lg transition">
                    <ArrowLeft size={24} />
                </a>
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Feedback & Reviews</h1>
                    {user && (
                        <p className="text-gray-600 text-lg">
                            {user.full_name}
                        </p>
                    )}
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 mb-6">
                    {error}
                </div>
            )}

            {/* Rating Display */}
            {ratings && (
                <div className="mb-8">
                    <RatingDisplay
                        averageRating={ratings.averageRating}
                        totalFeedbacks={ratings.totalFeedbacks}
                    />
                </div>
            )}

            {/* Feedbacks List */}
            <div className="space-y-4 flex-1">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">
                    All Reviews ({totalFeedbacks})
                </h2>

                {feedbacks.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <p className="text-gray-500 text-lg">No feedback yet</p>
                    </div>
                ) : (
                    feedbacks.map((feedback) => (
                        <div
                            key={feedback.id}
                            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-4 flex-1">
                                    <div
                                        style={{
                                            width: '48px',
                                            height: '48px',
                                            minWidth: '48px',
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            borderRadius: '50%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            fontWeight: 'bold',
                                            fontSize: '1.2rem',
                                        }}
                                    >
                                        {feedback.fromUser?.full_name?.[0]?.toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800 text-lg">
                                            {feedback.fromUser?.full_name || 'Anonymous'}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {getFeedbackTypeLabel(feedback.feedback_type)}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-xs text-gray-400 whitespace-nowrap ml-4">
                                    {formatDate(feedback.createdAt)}
                                </span>
                            </div>

                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex gap-1">{renderStars(feedback.rating)}</div>
                                <span className="text-sm font-bold text-gray-700">
                                    {feedback.rating}.0/5.0
                                </span>
                            </div>

                            {feedback.comment && (
                                <p className="text-gray-600 leading-relaxed text-base">
                                    "{feedback.comment}"
                                </p>
                            )}
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                    <button
                        onClick={() => setPage(Math.max(0, page - 1))}
                        disabled={page === 0}
                        className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                    >
                        Previous
                    </button>
                    <span className="text-gray-600 font-semibold">
                        Page {page + 1} of {totalPages}
                    </span>
                    <button
                        onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                        disabled={page === totalPages - 1}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserFeedbackPage;
