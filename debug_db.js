const db = require('./backend/src/models');

async function diagnose() {
    try {
        await db.sequelize.authenticate();
        console.log('Database connected.');

        const skills = await db.Skill.findAll({
            include: [
                {
                    model: db.User,
                    as: 'providers',
                    through: { attributes: ['proficiency'] }
                }
            ]
        });

        console.log('--- Current Skills and Providers ---');
        skills.forEach(skill => {
            console.log(`Skill: ${skill.name} (${skill.id})`);
            console.log(`  Providers (${skill.providers.length}):`);
            skill.providers.forEach(p => {
                console.log(`    - ${p.username} (${p.full_name}) - Proficiency: ${p.UserSkill.proficiency}`);
            });
        });

        const userSkills = await db.UserSkill.findAll();
        console.log('\n--- All UserSkill Records ---');
        userSkills.forEach(us => {
            console.log(`User: ${us.userId}, Skill: ${us.skillId}, Proficiency: ${us.proficiency}`);
        });

        const users = await db.User.findAll();
        console.log('\n--- All Users ---');
        users.forEach(u => {
            console.log(`User: ${u.username} (${u.id}) - Roll: ${u.roll_no}`);
        });

    } catch (err) {
        console.error('Diagnosis failed:', err);
    } finally {
        process.exit();
    }
}

diagnose();
