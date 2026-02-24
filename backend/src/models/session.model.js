module.exports = (sequelize, DataTypes) => {
    const Session = sequelize.define('Session', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        scheduled_time: {
            type: DataTypes.DATE,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('Pending', 'Confirmed', 'Completed', 'Cancelled'),
            defaultValue: 'Pending',
        },
        meeting_link: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    });

    return Session;
};
