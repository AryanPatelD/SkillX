module.exports = (sequelize, DataTypes) => {
    const UserSkill = sequelize.define('UserSkill', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        proficiency: {
            type: DataTypes.ENUM('Beginner', 'Intermediate', 'Expert'),
            defaultValue: 'Beginner',
        },
    });

    return UserSkill;
};
