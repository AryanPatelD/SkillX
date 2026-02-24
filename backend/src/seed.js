const db = require('./models');
const bcrypt = require('bcryptjs');

const seed = async () => {
    try {
        console.log('Syncing database...');
        await db.sequelize.sync({ force: true });
        console.log('Database synced!');

        // Create Skills
        const skillsData = [
            { name: 'Python', category: 'Programming' },
            { name: 'JavaScript', category: 'Programming' },
            { name: 'React', category: 'Web Development' },
            { name: 'Node.js', category: 'Backend Development' },
            { name: 'Graphic Design', category: 'Design' },
            { name: 'Calculus', category: 'Mathematics' },
            { name: 'Physics', category: 'Science' }
        ];

        const skills = await db.Skill.bulkCreate(skillsData);
        console.log('Skills seeded!');

        const passwordHash = await bcrypt.hash('password123', 10);

        // Create Users (Mixed Roles)
        const usersData = [
            {
                email: 'alex@example.com',
                password_hash: passwordHash,
                full_name: 'Alex (Teacher & Student)',
                roll_no: 'ALEX_001',
                bio: 'I teach React but I want to learn Calculus.',
                credits: 10
            },
            {
                email: 'tom@tutor.com',
                password_hash: passwordHash,
                full_name: 'Tutor Tom',
                roll_no: 'TOM_002',
                bio: 'Expert in Python and Backend technologies. 5 years experience.',
                credits: 10
            },
            {
                email: 'lisa@learner.com',
                password_hash: passwordHash,
                full_name: 'Learner Lisa',
                roll_no: 'LISA_003',
                bio: 'Student looking to learn coding.',
                credits: 10
            }
        ];
        const users = await db.User.bulkCreate(usersData);
        console.log('Users seeded!');

        const [alex, tom, lisa] = users;
        const [python, js, react, node, design, calculus, physics] = skills;

        // Assign Skills to Users
        // Alex teaches React
        await db.UserSkill.create({ userId: alex.id, skillId: react.id, proficiency: 'Expert' });
        // Tom teaches Python
        await db.UserSkill.create({ userId: tom.id, skillId: python.id, proficiency: 'Expert' });

        // Create Requests
        // Lisa Requests Python help from anyone (General Request)
        await db.SkillRequest.create({
            requesterId: lisa.id,
            skillId: python.id,
            description: 'Need help with Python loops.'
        });

        // Create Sessions
        // Alex requests a session with Tom for Python (Alex is learner here)
        await db.Session.create({
            requesterId: alex.id,
            providerId: tom.id,
            skillId: python.id,
            scheduled_time: new Date(Date.now() + 86400000), // Tomorrow
            status: 'Pending',
            meeting_link: 'zoom.us/j/123456'
        });

        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};

seed();
