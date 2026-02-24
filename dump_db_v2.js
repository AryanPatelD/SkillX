const path = require('path');
require('dotenv').config({ path: 'd:/Sem-4/Demo_SSE_1/backend/.env' });
const db = require('./backend/src/models');
const fs = require('fs');

async function dump() {
    const result = {
        connected: false,
        db_config: {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            db: process.env.DB_NAME,
            pass_exists: !!process.env.DB_PASS
        },
        users: [],
        skills: [],
        userSkills: [],
        error: null
    };

    try {
        await db.sequelize.authenticate();
        result.connected = true;

        result.users = await db.User.findAll({ attributes: ['id', 'username', 'full_name'] });
        result.skills = await db.Skill.findAll();
        result.userSkills = await db.UserSkill.findAll();

    } catch (err) {
        result.error = err.message + '\n' + err.stack;
    } finally {
        fs.writeFileSync('db_dump.json', JSON.stringify(result, null, 2));
        process.exit();
    }
}

dump();
