const { Client } = require('pg');

async function checkSchema() {
    const client = new Client({
        user: 'postgres',
        password: 'Aryan@2605',
        host: 'localhost',
        database: 'ssems_db',
        port: 5432,
    });

    try {
        await client.connect();
        
        // Check Users table columns
        const result = await client.query(`
            SELECT column_name, data_type
            FROM information_schema.columns 
            WHERE table_name = 'Users'
            ORDER BY ordinal_position
        `);

        console.log('📋 Users table columns:\n');
        result.rows.forEach(col => {
            console.log(`  ${col.column_name.padEnd(25)} ${col.data_type}`);
        });

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

checkSchema();
