const fs = require('fs');
const path = require('path');
const { sequelize } = require('./src/models');

const runQuizMigration = async () => {
    try {
        console.log('🔄 Running quiz migration...\n');
        
        const sqlFilePath = path.join(__dirname, 'migrations', '005_create_quiz_tables.sql');
        const sql = fs.readFileSync(sqlFilePath, 'utf8');
        
        // Execute the SQL
        await sequelize.query(sql);
        
        console.log('✅ Quiz migration completed successfully!\n');
        process.exit(0);
    } catch (err) {
        console.error('❌ Error running quiz migration:', err.message);
        process.exit(1);
    }
};

runQuizMigration();
