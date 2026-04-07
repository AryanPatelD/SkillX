module.exports = (sequelize, DataTypes) => {
    const QuizCategory = sequelize.define('QuizCategory', {
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
        description: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
    }, {
        tableName: 'QuizCategories',
    });

    return QuizCategory;
};
