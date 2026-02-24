const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'backend', '.env') });
const db = require('./backend/src/models');

async function check() {
    try {
        console.log('DB Config:', {
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            db: process.env.DB_NAME
        });

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

        console.log(`\n--- Found ${skills.length} Skills ---`);
        skills.forEach(s => {
            console.log(`[${s.name}] (ID: ${s.id}) Category: ${s.category}`);
            if (s.providers.length === 0) {
                console.log('  -> NO PROVIDERS');
            } else {
                s.providers.forEach(p => {
                    console.log(`  -> Provider: ${p.username} (${p.full_name}) Prof: ${p.UserSkill.proficiency}`);
                });
            }
        });

        const userSkills = await db.UserSkill.findAll();
        console.log(`\nTotal UserSkill records: ${userSkills.length}`);

    } catch (err) {
        console.error('Check failed:', err);
    } finally {
        await db.sequelize.close();
        process.exit();
    }
}

check();
