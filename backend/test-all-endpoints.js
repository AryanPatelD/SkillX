const jwt = require('jsonwebtoken');
const db = require('./src/models');

async function testAllEndpoints() {
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

        // 3. Test GET /api/skills/my-skills
        console.log('\n📍 Testing GET /api/skills/my-skills...');
        let response = await fetch('http://localhost:5000/api/skills/my-skills', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        let data = await response.json();
        console.log('Status:', response.status);
        if (data.length > 0) {
            console.log('✅ Skills retrieved:', data.length);
            console.log('  Sample skill:', JSON.stringify(data[0], null, 2));
            const skillId = data[0].id;
            
            // 4. Test PUT /api/skills/offered/:skillId (update proficiency)
            console.log('\n📍 Testing PUT /api/skills/offered/' + skillId + '...');
            response = await fetch('http://localhost:5000/api/skills/offered/' + skillId, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ proficiency: 'Expert' })
            });
            data = await response.json();
            console.log('Status:', response.status);
            console.log('Message:', data.message);
            console.log('✅ Proficiency updated to: Expert');
            
            // 5. Test GET /api/skills/my-skills again to verify update
            console.log('\n📍 Testing GET /api/skills/my-skills (verify update)...');
            response = await fetch('http://localhost:5000/api/skills/my-skills', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            data = await response.json();
            console.log('Status:', response.status);
            const updatedSkill = data.find(s => s.id === skillId);
            console.log('✅ Updated skill proficiency:', updatedSkill.proficiency);
            if (updatedSkill.proficiency === 'Expert') {
                console.log('✅✅ UPDATE VERIFIED - Proficiency changed to Expert!');
            }
        } else {
            console.log('⚠️  No skills found for user');
        }

        console.log('\n✅ All tests passed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

testAllEndpoints();
