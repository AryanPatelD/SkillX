const db = require('./backend/src/models');
const fs = require('fs');

async function dump() {
    const result = {
        connected: false,
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

        // Specific search test for "ML"
        const { Op } = require('sequelize');
        const searchResult = await db.Skill.findAll({
            where: {
                [Op.or]: [
                    { name: { [Op.iLike]: '%ML%' } },
                    { category: { [Op.iLike]: '%ML%' } }
                ]
            }
        });
        result.searchTestML = searchResult;

    } catch (err) {
        result.error = err.message + '\n' + err.stack;
    } finally {
        fs.writeFileSync('db_dump.json', JSON.stringify(result, null, 2));
        process.exit();
    }
}

dump();
