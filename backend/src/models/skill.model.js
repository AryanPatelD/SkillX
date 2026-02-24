module.exports = (sequelize, DataTypes) => {
    const Skill = sequelize.define('Skill', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        category: {
            type: DataTypes.STRING,
            allowNull: false,
        },
    });

    return Skill;
};
