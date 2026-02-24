const sequelize = require('./src/config/database');
const { v4: uuidv4 } = require('uuid');

async function fixNullRollNumbers() {
    try {
        console.log('Fixing NULL roll_no values...\n');
        
        // Connect to database
        await sequelize.authenticate();
        console.log('✅ Connected to database');
        
        // Get users with NULL roll_no
        const result = await sequelize.query(
            `SELECT id, email FROM "Users" WHERE roll_no IS NULL`
        );
        
        const usersWithNullRollNo = result[0];
        console.log(`Found ${usersWithNullRollNo.length} users with NULL roll_no\n`);
        
        if (usersWithNullRollNo.length > 0) {
            // Update each user with a unique roll_no based on their email
            for (const user of usersWithNullRollNo) {
                // Generate a unique roll_no from the email or use a placeholder
                const rollNo = user.email.split('@')[0].toUpperCase() + '_' + Math.random().toString(36).substring(7).toUpperCase();
                
                await sequelize.query(
                    `UPDATE "Users" SET roll_no = :rollNo WHERE id = :userId`,
                    {
                        replacements: { rollNo, userId: user.id },
                        type: sequelize.QueryTypes.UPDATE
                    }
                );
                console.log(`✅ Updated ${user.email} with roll_no: ${rollNo}`);
            }
            
            console.log('\n🎉 All NULL roll_no values updated!');
        } else {
            console.log('✅ No users with NULL roll_no found');
        }
        
        // Check final state
        const finalCheck = await sequelize.query(
            `SELECT COUNT(*) as total, COUNT(CASE WHEN roll_no IS NULL THEN 1 END) as null_count FROM "Users"`
        );
        
        console.log(`\nFinal check:`);
        console.log(`  Total users: ${finalCheck[0][0].total}`);
        console.log(`  Users with NULL roll_no: ${finalCheck[0][0].null_count}`);
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        await sequelize.close();
        console.log('\n✅ Database connection closed');
    }
}

fixNullRollNumbers();
