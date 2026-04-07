module.exports = (sequelize, DataTypes) => {
    const QuizAttempt = sequelize.define('QuizAttempt', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id',
            },
        },
        categoryId: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'QuizCategories',
                key: 'id',
            },
        },
        score: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        total_questions: {
            type: DataTypes.INTEGER,
            defaultValue: 10,
            allowNull: false,
        },
        percentage: {
            type: DataTypes.DECIMAL(5, 2),
            allowNull: false,
        },
        passed: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        attempted_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        next_attempt_allowed_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    }, {
        tableName: 'QuizAttempts',
    });

    return QuizAttempt;
};
