const path = require('path');
const dbContent = require('./backend/src/models/index.js');
const { Skill, User, UserSkill, sequelize } = dbContent;

async function diagnose() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');

        const skills = await Skill.findAll({
            include: [
                {
                    model: User,
                    as: 'providers',
                    through: { attributes: ['proficiency'] }
                }
            ]
        });

        console.log(`\n--- Skills in Database (${skills.length}) ---`);
        skills.forEach(s => {
            console.log(`- ${s.name} (${s.id})`);
            console.log(`  Providers: ${s.providers.length}`);
            s.providers.forEach(p => {
                console.log(`    * ${p.username} (${p.full_name}) - ${p.UserSkill.proficiency}`);
            });
        });

        const userSkills = await UserSkill.findAll();
        console.log(`\n--- UserSkill Entries (${userSkills.length}) ---`);
        userSkills.forEach(us => {
            console.log(`  User: ${us.userId} -> Skill: ${us.skillId} (${us.proficiency})`);
        });

    } catch (err) {
        console.error('Diagnosis error:', err);
    } finally {
        sequelize.close();
        process.exit();
    }
}

diagnose();
