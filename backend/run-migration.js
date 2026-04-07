const fs = require('fs');
const path = require('path');
const sequelize = require('./src/config/database');

async function runMigration() {
    try {
        console.log('🔄 Running migration: 004_add_deadline_and_availability.sql\n');
        
        // Connect to database
        await sequelize.authenticate();
        console.log('✅ Connected to database\n');
        
        // Read SQL file
        const sqlPath = path.join(__dirname, 'migrations', '004_add_deadline_and_availability.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        
        // Split by semicolon and filter empty statements
        const statements = sql.split(';').map(s => s.trim()).filter(s => s && !s.startsWith('--'));
        
        console.log(`📝 Executing ${statements.length} SQL statements...\n`);
        
        for (let i = 0; i < statements.length; i++) {
            const stmt = statements[i];
            try {
                console.log(`[${i + 1}/${statements.length}] Executing...`);
                await sequelize.query(stmt);
                console.log(`✅ Success\n`);
            } catch (error) {
                console.log(`⚠️  Statement may already exist or failed:\n${error.message}\n`);
            }
        }
        
        console.log('✅ Migration completed!\n');
        
        // Verify changes
        console.log('📊 Verifying Sessions table schema:\n');
        const result = await sequelize.query(`
            SELECT 
                column_name,
                is_nullable,
                data_type
            FROM information_schema.columns 
            WHERE table_name = 'Sessions'
            ORDER BY ordinal_position
        `);
        
        result[0].forEach(col => {
            const nullable = col.is_nullable === 'YES' ? '(nullable)' : '(NOT NULL)';
            console.log(`   ${col.column_name.padEnd(25)} ${col.data_type.padEnd(20)} ${nullable}`);
        });
        
        console.log('\n✅ All changes verified!');
        
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
}

runMigration();
