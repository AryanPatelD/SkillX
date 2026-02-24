const { Skill, User, UserSkill, sequelize } = require('./backend/src/models');
const fs = require('fs');

async function diagnose() {
    let report = '';
    const log = (msg) => {
        console.log(msg);
        report += msg + '\n';
    };

    try {
        await sequelize.authenticate();
        log('Connected to database.');

        const skills = await Skill.findAll();
        log(`Total Skills: ${skills.length}`);
        for (const skill of skills) {
            log(`- Skill: ${skill.name} ID: ${skill.id}`);
            const providers = await skill.getProviders();
            log(`  Providers: ${providers.length}`);
            for (const p of providers) {
                log(`    - Provider: ${p.username} (${p.full_name})`);
            }
        }

        const userSkills = await UserSkill.findAll();
        log(`Total UserSkill entries: ${userSkills.length}`);
        for (const us of userSkills) {
            log(`- UserID: ${us.userId}, SkillID: ${us.skillId}, Proficiency: ${us.proficiency}`);
        }

        const users = await User.findAll();
        log(`Total Users: ${users.length}`);
        for (const user of users) {
            const offered = await user.getOfferedSkills();
            log(`- User: ${user.username} (${user.id}) offers ${offered.length} skills`);
        }

    } catch (err) {
        log('ERROR during diagnosis: ' + err.message);
        log(err.stack);
    } finally {
        fs.writeFileSync('diag_report.txt', report);
        await sequelize.close();
        process.exit(0);
    }
}

diagnose();
