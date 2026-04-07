const { sequelize, User, Skill, UserSkill, SkillRequest, Session } = require('./src/models');

async function checkDemoUser() {
    try {
        await sequelize.authenticate();
        console.log('Database connected');

        // Find DEMO user by roll_no
        const user = await User.findOne({ where: { roll_no: 'd25ce158' } });
        if (!user) {
            console.log('❌ DEMO user (d25ce158) NOT FOUND in database');
            process.exit(0);
        }

        console.log('✅ DEMO user found:');
        console.log('   ID:', user.id);
        console.log('   Roll No:', user.roll_no);
        console.log('   Full Name:', user.full_name);
        console.log('   Credits:', user.credits);

        // Check user skills
        const userWithSkills = await User.findOne({
            where: { roll_no: 'd25ce158' },
            include: [{ model: Skill, as: 'offeredSkills', through: { attributes: [] } }]
        });
        console.log('\n📚 Skills offered by DEMO user:', userWithSkills.offeredSkills?.length || 0);
        userWithSkills.offeredSkills?.forEach(s => console.log('   -', s.name));

        // Check skill requests
        const requests = await SkillRequest.findAll({
            where: { requesterId: user.id },
            include: [{ model: Skill, as: 'skill' }]
        });
        console.log('\n🆘 Skill requests by DEMO user:', requests.length);
        requests.forEach(r => console.log('   - Requested:', r.skill?.name, '(Status:', r.status + ')'));

        // Check sessions
        const sessionsAsProvider = await Session.findAll({ where: { providerId: user.id } });
        const sessionsAsRequester = await Session.findAll({ where: { requesterId: user.id } });
        console.log('\n👥 Sessions as provider (teaching):', sessionsAsProvider.length);
        console.log('👥 Sessions as requester (learning):', sessionsAsRequester.length);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

checkDemoUser();
