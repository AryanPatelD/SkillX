import React from 'react';

const RatingDisplay = ({ averageRating, totalFeedbacks }) => {
    const getRatingColor = (rating) => {
        if (rating >= 4.5) return 'text-green-600';
        if (rating >= 3.5) return 'text-blue-600';
        if (rating >= 2.5) return 'text-yellow-600';
        return 'text-red-600';
    };

    const getRatingLabel = (rating) => {
        if (rating >= 4.5) return 'Excellent';
        if (rating >= 3.5) return 'Very Good';
        if (rating >= 2.5) return 'Good';
        if (rating >= 1.5) return 'Fair';
        return 'Poor';
    };

    return (
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">User Rating</h3>
                <span className="text-xs px-3 py-1 bg-gray-200 text-gray-700 rounded-full">
                    {totalFeedbacks} {totalFeedbacks === 1 ? 'review' : 'reviews'}
                </span>
            </div>

            <div className="flex items-center gap-4">
                {/* Star Rating */}
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className={`text-4xl font-bold ${getRatingColor(averageRating)}`}>
                            {averageRating.toFixed(1)}
                        </span>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                    key={star}
                                    className={`text-xl ${
                                        star <= Math.round(averageRating)
                                            ? 'text-yellow-400'
                                            : 'text-gray-300'
                                    }`}
                                >
                                    ★
                                </span>
                            ))}
                        </div>
                    </div>
                    <p className="text-sm text-gray-600">
                        {getRatingLabel(averageRating)}
                    </p>
                </div>

                {/* Rating Distribution */}
                {totalFeedbacks > 0 && (
                    <div className="flex-1">
                        <div className="space-y-2">
                            {[5, 4, 3, 2, 1].map((star) => (
                                <div key={star} className="flex items-center gap-2 text-xs">
                                    <span className="w-8">{star} star</span>
                                    <div className="w-32 h-2 bg-gray-300 rounded-full overflow-hidden">
                                        <div className="h-full bg-yellow-400 rounded-full"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {totalFeedbacks === 0 && (
                <p className="text-center text-gray-500 text-sm py-4">
                    No ratings yet. Be the first to rate!
                </p>
            )}
        </div>
    );
};

export default RatingDisplay;
