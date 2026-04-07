module.exports = (sequelize, DataTypes) => {
    const Feedback = sequelize.define(
        'Feedback',
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            session_id: {
                type: DataTypes.UUID,
                references: {
                    model: 'MeetingSessions',
                    key: 'id',
                },
                onDelete: 'SET NULL',
                allowNull: true,
                comment: 'Reference to the meeting session',
            },
            from_user_id: {
                type: DataTypes.UUID,
                references: {
                    model: 'Users',
                    key: 'id',
                },
                onDelete: 'SET NULL',
                allowNull: false,
                comment: 'User who is giving the feedback',
            },
            to_user_id: {
                type: DataTypes.UUID,
                references: {
                    model: 'Users',
                    key: 'id',
                },
                onDelete: 'SET NULL',
                allowNull: false,
                comment: 'User receiving the feedback',
            },
            feedback_type: {
                type: DataTypes.ENUM('tutor_to_learner', 'learner_to_tutor'),
                allowNull: false,
                comment: 'Type of feedback: tutor to learner or learner to tutor',
            },
            rating: {
                type: DataTypes.INTEGER,
                allowNull: false,
                validate: {
                    min: 1,
                    max: 5,
                },
                comment: 'Rating from 1-5 stars',
            },
            comment: {
                type: DataTypes.TEXT,
                allowNull: true,
                comment: 'Text feedback/comment',
            },
            categories: {
                type: DataTypes.JSONB,
                defaultValue: {},
                comment: 'Categorical feedback (e.g., {"communication": 4, "knowledge": 5})',
            },
        },
        {
            tableName: 'Feedbacks',
            timestamps: true,
            indexes: [
                { fields: ['from_user_id'] },
                { fields: ['to_user_id'] },
                { fields: ['session_id'] },
                { fields: ['feedback_type'] },
                { fields: ['from_user_id', 'to_user_id', 'session_id'], unique: true, name: 'unique_feedback_per_session' },
            ],
        }
    );

    return Feedback;
};
