const sequelize = require('../src/config/database');

async function dropUsernameColumn() {
    try {
        console.log('Dropping username column from Users table...\n');
        
        // Connect to database
        await sequelize.authenticate();
        console.log('✅ Connected to database');
        
        // Drop the column
        await sequelize.query(`ALTER TABLE "Users" DROP COLUMN username`);
        console.log('✅ Successfully dropped username column');
        
        // Verify it's gone
        const result = await sequelize.query(`
            SELECT 
                column_name,
                is_nullable,
                data_type
            FROM information_schema.columns 
            WHERE table_name = 'Users'
            ORDER BY ordinal_position
        `);
        
        console.log('\n📊 Updated User Table Columns:\n');
        result[0].forEach(col => {
            const nullable = col.is_nullable === 'YES' ? '(nullable)' : '(NOT NULL)';
            console.log(`   ${col.column_name.padEnd(15)} ${col.data_type.padEnd(20)} ${nullable}`);
        });
        
        console.log('\n🎉 Username column removed successfully!');
        
    } catch (error) {
        console.error('❌ Failed to drop username column:', error.message);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

dropUsernameColumn();
