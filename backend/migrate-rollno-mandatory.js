const sequelize = require('./src/config/database');
const fs = require('fs');
const path = require('path');

async function runMigration() {
    try {
        console.log('Starting Roll_NO mandatory migration...\n');
        
        // Connect to database
        await sequelize.authenticate();
        console.log('✅ Connected to database');
        
        // Read migration file
        const migrationPath = path.join(__dirname, 'migrations', '003_make_rollno_mandatory.sql');
        const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
        
        // Split into individual statements
        const statements = migrationSQL.split(';').filter(stmt => stmt.trim());
        
        // Execute each statement
        for (const statement of statements) {
            if (statement.trim()) {
                console.log(`\nExecuting: ${statement.substring(0, 80)}...`);
                await sequelize.query(statement);
                console.log('✅ Statement executed');
            }
        }
        
        console.log('\n🎉 Migration completed successfully!');
        console.log('✅ Roll_NO is now mandatory');
        console.log('✅ Username is now optional');
        
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    } finally {
        await sequelize.close();
        console.log('\n✅ Database connection closed');
    }
}

runMigration();
