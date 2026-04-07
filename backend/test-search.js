const db = require('./src/models');
const { User, Skill } = db;

async function testSearch() {
    try {
        await db.sequelize.authenticate();
        console.log('✅ Database connected\n');

        // Test: Get all open skill requests
        console.log('📋 All Open Skill Requests:');
        const allRequests = await db.SkillRequest.findAll({
            where: { status: 'Open' },
            include: [
                { model: User, as: 'requester', attributes: ['full_name', 'roll_no'] },
                { model: Skill, as: 'skill', attributes: ['name'] }
            ]
        });
        console.log(`  Found: ${allRequests.length}`);
        allRequests.forEach(r => console.log(`    - ${r.requester?.full_name} requesting ${r.skill?.name} (${r.description})`));

        // Test: Get all offered skills
        console.log('\n📚 All Offered Skills:');
        const allSkills = await Skill.findAll({
            include: [
                {
                    model: User,
                    as: 'providers',
                    attributes: ['id', 'full_name', 'roll_no'],
                    through: { attributes: ['proficiency'] },
                    required: true
                }
            ],
            subQuery: false,
            distinct: true
        });
        console.log(`  Found: ${allSkills.length}`);
        allSkills.forEach(s => {
            console.log(`    - ${s.name}`);
            s.providers.forEach(p => console.log(`        Offered by: ${p.full_name}`));
        });

        // Test: DEMO user's perspective
        const demoUser = await User.findOne({ where: { roll_no: 'd25ce158' } });
        console.log('\n👤 From DEMO user perspective:');
        console.log(`  User ID: ${demoUser.id}`);

        // Skills offered by DEMO
        const demoSkills = await demoUser.getOfferedSkills();
        console.log(`  Skills DEMO offers: ${demoSkills.length}`);
        demoSkills.forEach(s => console.log(`    - ${s.name}`));

        // Requests by DEMO
        const demoRequests = await db.SkillRequest.findAll({
            where: { requesterId: demoUser.id },
            include: [{ model: Skill, as: 'skill' }]
        });
        console.log(`  Requests by DEMO: ${demoRequests.length}`);
        demoRequests.forEach(r => console.log(`    - ${r.skill?.name} (${r.status})`));

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error);
        process.exit(1);
    }
}

testSearch();
