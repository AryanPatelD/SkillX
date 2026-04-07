-- Create Feedback table
CREATE TABLE IF NOT EXISTS "Feedbacks" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES "MeetingSessions"(id) ON DELETE SET NULL,
    from_user_id UUID REFERENCES "Users"(id) ON DELETE SET NULL NOT NULL,
    to_user_id UUID REFERENCES "Users"(id) ON DELETE SET NULL NOT NULL,
    feedback_type VARCHAR(50) NOT NULL CHECK (feedback_type IN ('tutor_to_learner', 'learner_to_tutor')),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    categories JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(from_user_id, to_user_id, session_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_feedbacks_from_user_id ON "Feedbacks"(from_user_id);
CREATE INDEX idx_feedbacks_to_user_id ON "Feedbacks"(to_user_id);
CREATE INDEX idx_feedbacks_session_id ON "Feedbacks"(session_id);
CREATE INDEX idx_feedbacks_feedback_type ON "Feedbacks"(feedback_type);
