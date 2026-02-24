const sequelize = require('./src/config/database');

async function verifyMigration() {
    try {
        console.log('Verifying migration...\n');
        
        // Connect to database
        await sequelize.authenticate();
        
        // Get column constraints
        const result = await sequelize.query(`
            SELECT 
                column_name,
                is_nullable,
                data_type
            FROM information_schema.columns 
            WHERE table_name = 'Users'
            ORDER BY ordinal_position
        `);
        
        console.log('📊 User Table Columns:\n');
        result[0].forEach(col => {
            const nullable = col.is_nullable === 'YES' ? '(nullable)' : '(NOT NULL)';
            console.log(`   ${col.column_name.padEnd(15)} ${col.data_type.padEnd(20)} ${nullable}`);
        });
        
        // Check username constraint
        const usernameConstraint = await sequelize.query(`
            SELECT constraint_name 
            FROM information_schema.table_constraints 
            WHERE table_name = 'Users' 
            AND constraint_name LIKE '%username%'
        `);
        
        console.log(`\n🔐 Username Constraints:`);
        if (usernameConstraint[0].length === 0) {
            console.log('   ✅ No unique constraint on username');
        } else {
            console.log(`   Found: ${usernameConstraint[0].map(c => c.constraint_name).join(', ')}`);
        }
        
        // Check roll_no constraint
        const rollnoConstraint = await sequelize.query(`
            SELECT constraint_name 
            FROM information_schema.table_constraints 
            WHERE table_name = 'Users' 
            AND constraint_name LIKE '%roll_no%'
        `);
        
        console.log(`\n🔐 Roll_NO Constraints:`);
        if (rollnoConstraint[0].length > 0) {
            console.log(`   ✅ ${rollnoConstraint[0].map(c => c.constraint_name).join(', ')}`);
        }
        
        // Check sample users
        const users = await sequelize.query(
            `SELECT id, email, roll_no, username FROM "Users" LIMIT 3`
        );
        
        console.log('\n👥 Sample Users:\n');
        users[0].forEach(user => {
            console.log(`   Email: ${user.email}`);
            console.log(`   Roll_NO: ${user.roll_no}`);
            console.log(`   Username: ${user.username || 'NULL'}`);
            console.log('   ---');
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
