const { Client } = require('pg');

async function runMigration() {
    const client = new Client({
        user: 'postgres',
        password: 'Aryan@2605',
        host: 'localhost',
        database: 'ssems_db',
        port: 5432,
    });

    try {
        await client.connect();
        console.log('✅ Connected to PostgreSQL\n');

        // 1. Add video_provider column
        console.log('1️⃣  Adding video_provider column...');
        try {
            await client.query(`
                ALTER TABLE "MeetingSessions" 
                ADD COLUMN "video_provider" VARCHAR(50) DEFAULT 'daily' CHECK ("video_provider" IN ('jitsi', 'daily', 'whereby'));
            `);
            console.log('✅ video_provider added\n');
        } catch (err) {
            console.log('⚠️  video_provider might already exist:', err.message.split('\n')[0], '\n');
        }

        // 2. Add provider_room_id column
        console.log('2️⃣  Adding provider_room_id column...');
        try {
            await client.query(`
                ALTER TABLE "MeetingSessions"
                ADD COLUMN "provider_room_id" VARCHAR(255) UNIQUE;
            `);
            console.log('✅ provider_room_id added\n');
        } catch (err) {
            console.log('⚠️  provider_room_id might already exist:', err.message.split('\n')[0], '\n');
        }

        // 3. Create indexes
        console.log('3️⃣  Creating indexes...');
        try {
            await client.query(`
                CREATE INDEX idx_meeting_sessions_video_provider ON "MeetingSessions"("video_provider");
            `);
            console.log('✅ video_provider index created');
        } catch (err) {
            console.log('⚠️  Index might already exist:', err.message.split('\n')[0]);
        }

        try {
            await client.query(`
                CREATE INDEX idx_meeting_sessions_provider_room_id ON "MeetingSessions"("provider_room_id");
            `);
            console.log('✅ provider_room_id index created\n');
        } catch (err) {
            console.log('⚠️  Index might already exist:', err.message.split('\n')[0], '\n');
        }

        // 4. Verify columns exist
        console.log('4️⃣  Verifying schema...');
        const result = await client.query(`
            SELECT column_name, data_type, is_nullable
            FROM information_schema.columns 
            WHERE table_name = 'MeetingSessions'
            ORDER BY ordinal_position
        `);

        console.log('\n📋 MeetingSessions table columns:\n');
        result.rows.forEach(col => {
            const nullable = col.is_nullable === 'YES' ? '(nullable)' : '(NOT NULL)';
            const highlight = (col.column_name === 'video_provider' || col.column_name === 'provider_room_id') ? '✨' : '  ';
            console.log(`${highlight} ${col.column_name.padEnd(25)} ${col.data_type.padEnd(20)} ${nullable}`);
        });

        console.log('\n✅✅ Migration completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

runMigration();
