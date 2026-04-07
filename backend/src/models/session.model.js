module.exports = (sequelize, DataTypes) => {
    const Session = sequelize.define('Session', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        requesterId: {
            type: DataTypes.UUID,
            allowNull: true,
            comment: 'Foreign key to User (requester)',
        },
        providerId: {
            type: DataTypes.UUID,
            allowNull: true,
            comment: 'Foreign key to User (provider/teacher)',
        },
        skillId: {
            type: DataTypes.UUID,
            allowNull: true,
            comment: 'Foreign key to Skill',
        },
        skillRequestId: {
            type: DataTypes.UUID,
            allowNull: true,
            comment: 'Reference to the SkillRequest this session is for',
        },
        scheduled_time: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        provider_available_from: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: 'When the provider can start teaching',
        },
        provider_available_to: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: 'When the provider can stop teaching',
        },
        status: {
            type: DataTypes.ENUM('Pending', 'Confirmed', 'Completed', 'Cancelled'),
            defaultValue: 'Pending',
        },
        meeting_link: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        cancelledAt: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: 'Timestamp when session was cancelled - used for auto-deletion after 1-2 hours',
        },
    });

    return Session;
};
