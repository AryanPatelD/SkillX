module.exports = (sequelize, DataTypes) => {
    const MeetingSession = sequelize.define(
        'MeetingSession',
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            learner_name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            tutor_id: {
                type: DataTypes.UUID,
                references: {
                    model: 'Users',
                    key: 'id',
                },
                onDelete: 'SET NULL',
                allowNull: true,
                comment: 'Foreign key to User (tutor)',
            },
            learner_id: {
                type: DataTypes.UUID,
                references: {
                    model: 'Users',
                    key: 'id',
                },
                onDelete: 'SET NULL',
                allowNull: true,
                comment: 'Foreign key to User (learner)',
            },
            status: {
                type: DataTypes.ENUM('pending', 'scheduled', 'completed', 'cancelled'),
                defaultValue: 'pending',
                comment: 'Session status: pending, scheduled, completed, or cancelled',
            },
            confirmed_slot: {
                type: DataTypes.JSONB,
                allowNull: true,
                comment: '{ date: STRING, startTime: STRING, endTime: STRING }',
            },
            proposed_slots: {
                type: DataTypes.JSONB,
                allowNull: true,
                comment: '[{ date: STRING, startTime: STRING, endTime: STRING }, ...]',
            },
            meeting_link: {
                type: DataTypes.STRING,
                allowNull: true,
                comment: 'Generated meeting link (Jitsi)',
            },
            video_provider: {
                type: DataTypes.ENUM('daily', 'jitsi', 'whereby'),
                defaultValue: 'daily',
                comment: 'Video conferencing provider: daily (Daily.co), jitsi (Jitsi Meet), whereby (Whereby)',
            },
            provider_room_id: {
                type: DataTypes.STRING,
                allowNull: true,
                unique: true,
                comment: 'Provider-specific room ID (Daily.co token, room name, etc.)',
            },
        },
        {
            tableName: 'MeetingSessions',
            timestamps: true,
            indexes: [
                { fields: ['status'] },
                { fields: ['tutor_id'] },
                { fields: ['learner_id'] },
            ],
        }
    );

    return MeetingSession;
};
