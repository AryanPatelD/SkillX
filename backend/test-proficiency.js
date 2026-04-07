const jwt = require('jsonwebtoken');
const db = require('./src/models');

async function testProficiency() {
    try {
        // 1. Find demo user
        const user = await db.User.findOne({ where: { roll_no: 'd25ce158' } });
        if (!user) {
            console.log('❌ Demo user not found');
            process.exit(1);
        }
        console.log('✅ Demo user found (ID: ' + user.id + ')');

        // 2. Create JWT token
        const token = jwt.sign(
            { id: user.id, roll_no: user.roll_no },
            process.env.JWT_SECRET || 'test-secret'
        );
        console.log('✅ JWT token created');

        // 3. Call /api/skills/my-skills with token (using native fetch)
        console.log('\n📍 Calling GET /api/skills/my-skills...');
        const response = await fetch('http://localhost:5000/api/skills/my-skills', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('\n📦 Response Data:');
        console.log(JSON.stringify(data, null, 2));

        // 4. Check if proficiency is present
        console.log('\n✅ Checking response structure:');
        if (Array.isArray(data)) {
            data.forEach((skill, idx) => {
                console.log(`\n  Skill ${idx + 1}:`);
                console.log(`    - id: ${skill.id}`);
                console.log(`    - name: ${skill.name}`);
                console.log(`    - category: ${skill.category}`);
                console.log(`    - proficiency: ${skill.proficiency} ${skill.proficiency ? '✅' : '❌ MISSING'}`);
                console.log(`    - userSkillId: ${skill.userSkillId}`);
            });
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

testProficiency();
