const sequelize = require('./src/config/database');

async function verifyMigration() {
    try {
        console.log('Verifying database migration...\n');
        
        // Connect to database
        await sequelize.authenticate();
        
        // Check if credits column exists
        const result = await sequelize.query(
            `SELECT column_name FROM information_schema.columns WHERE table_name = 'Users' AND column_name = 'credits'`
        );
        
        if (result[0].length > 0) {
            console.log('✅ Credits column exists in Users table');
        } else {
            console.log('❌ Credits column not found');
        }
        
        // Get user count and credits info
        const userStats = await sequelize.query(
            `SELECT COUNT(*) as total_users, AVG(credits) as avg_credits, MIN(credits) as min_credits, MAX(credits) as max_credits FROM "Users"`
        );
        
        console.log('\n📊 User Statistics:');
        console.log(`   Total users: ${userStats[0][0].total_users}`);
        console.log(`   Average credits: ${userStats[0][0].avg_credits}`);
        console.log(`   Min credits: ${userStats[0][0].min_credits}`);
        console.log(`   Max credits: ${userStats[0][0].max_credits}`);
        
        // Get sample users
        const users = await sequelize.query(
            `SELECT id, username, email, credits FROM "Users" LIMIT 5`
        );
        
        if (users[0].length > 0) {
            console.log('\n👥 Sample Users:');
            console.log('────────────────────────────────────────');
            users[0].forEach(user => {
                console.log(`  Username: ${user.username}`);
                console.log(`  Email: ${user.email}`);
                console.log(`  Credits: ${user.credits}`);
                console.log('────────────────────────────────────────');
            });
        }
        
        console.log('\n🎉 Database migration verified successfully!');
        
    } catch (error) {
        console.error('❌ Verification failed:', error.message);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

verifyMigration();
