const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(
    String(process.env.DB_NAME),
    String(process.env.DB_USER),
    String(process.env.DB_PASS),
    {
        host: String(process.env.DB_HOST),
        dialect: 'postgres',
        logging: false,
    }
);

module.exports = sequelize;
