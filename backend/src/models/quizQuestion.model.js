module.exports = (sequelize, DataTypes) => {
    const QuizQuestion = sequelize.define('QuizQuestion', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        categoryId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'QuizCategories',
                key: 'id',
            },
        },
        question: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        option_a: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        option_b: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        option_c: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        option_d: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        correct_answer: {
            type: DataTypes.ENUM('A', 'B', 'C', 'D'),
            allowNull: false,
        },
        difficulty_level: {
            type: DataTypes.ENUM('Easy', 'Medium', 'Hard'),
            allowNull: false,
        },
    }, {
        tableName: 'QuizQuestions',
    });

    return QuizQuestion;
};
