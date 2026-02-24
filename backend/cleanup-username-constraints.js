const sequelize = require('./src/config/database');

async function cleanupConstraints() {
    try {
        console.log('Cleaning up leftover constraints...\n');
        
        // Connect to database
        await sequelize.authenticate();
        
        // Get all username constraints
        const constraints = await sequelize.query(`
            SELECT constraint_name 
            FROM information_schema.table_constraints 
            WHERE table_name = 'Users' 
            AND constraint_name LIKE '%username%'
            AND constraint_type = 'UNIQUE'
        `);
        
        console.log(`Found ${constraints[0].length} username constraints to drop:\n`);
        
        // Drop each constraint
        for (const constraint of constraints[0]) {
            const constraintName = constraint.constraint_name;
            console.log(`   Dropping: ${constraintName}...`);
            await sequelize.query(`ALTER TABLE "Users" DROP CONSTRAINT "${constraintName}"`);
            console.log(`   ✅ Dropped`);
        }
        
        console.log('\n🎉 Cleanup complete!');
        
    } catch (error) {
        console.error('❌ Cleanup failed:', error.message);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

cleanupConstraints();
