module.exports = (sequelize, DataTypes) => {
    const SkillRequest = sequelize.define('SkillRequest', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        status: {
            type: DataTypes.ENUM('Open', 'In_Progress', 'Closed'),
            defaultValue: 'Open',
        },
    });

    return SkillRequest;
};
