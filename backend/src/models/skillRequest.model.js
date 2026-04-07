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
        deadline: {
            type: DataTypes.DATE,
            allowNull: true,
            comment: 'Deadline by which the skill needs to be learned',
        },
        status: {
            type: DataTypes.ENUM('Open', 'In_Progress', 'Closed'),
            defaultValue: 'Open',
        },
    });

    return SkillRequest;
};
