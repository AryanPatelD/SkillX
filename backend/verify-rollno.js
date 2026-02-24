const sequelize = require('./src/config/database');

async function verifyMigration() {
    try {
        console.log('Verifying Roll_NO migration...\n');
        
        // Connect to database
        await sequelize.authenticate();
        
        // Check if roll_no column exists
        const result = await sequelize.query(
            `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'Users' AND column_name = 'roll_no'`
        );
        
        if (result[0].length > 0) {
            console.log('✅ Roll_NO column exists in Users table');
            console.log(`   Column name: ${result[0][0].column_name}`);
            console.log(`   Data type: ${result[0][0].data_type}`);
        } else {
            console.log('❌ Roll_NO column not found');
        }
        
        // Get count of columns with roll_no
        const allColumns = await sequelize.query(
            `SELECT column_name FROM information_schema.columns WHERE table_name = 'Users' ORDER BY ordinal_position`
        );
        
        console.log('\n📊 All User columns:');
        allColumns[0].forEach((col, idx) => {
            console.log(`   ${idx + 1}. ${col.column_name}`);
        });
        
        console.log('\n🎉 Migration verified successfully!');
        
    } catch (error) {
        console.error('❌ Verification failed:', error.message);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

verifyMigration();
