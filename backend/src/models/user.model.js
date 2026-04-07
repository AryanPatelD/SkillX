module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        roll_no: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password_hash: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        full_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        bio: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        credits: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
            allowNull: false,
        },
        last_quiz_attempt_at: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        quiz_cooldown_until: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    });

    return User;
};
