const db = require('./backend/src/models');

async function checkDb() {
    try {
        await db.sequelize.authenticate();
        console.log('DB connected.');

        const skills = await db.Skill.findAll();
        console.log('Total Skills:', skills.length);
        skills.forEach(s => console.log(`- ${s.name} (${s.id})`));

        const userSkills = await db.UserSkill.findAll();
        console.log('Total UserSkills:', userSkills.length);
        userSkills.forEach(us => console.log(`- User: ${us.userId}, Skill: ${us.skillId}, Prof: ${us.proficiency}`));

        const users = await db.User.findAll({ attributes: ['id', 'username'] });
        console.log('Users:', users.map(u => u.username).join(', '));

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await db.sequelize.close();
    }
}

checkDb();
