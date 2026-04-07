const { Client } = require('pg');
const crypto = require('crypto');

// Daily.co room name generator (same as in service)
function generateDailyRoomName(meetingId) {
    const sessionIdPrefix = meetingId.substring(0, 8);
    const timestamp = Date.now().toString(36).toUpperCase();
    return `skillexchange-${sessionIdPrefix}-${timestamp}`.toLowerCase();
}

function generateDailyUrl(roomName) {
    return `https://daily.co/${roomName}`;
}

async function migrateOldMeetings() {
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

        // Find all meetings with Jitsi links or NULL provider_room_id
        console.log('1️⃣  Finding old Jitsi meetings...');
        const result = await client.query(`
            SELECT id, meeting_link, provider_room_id, video_provider
            FROM "MeetingSessions"
            WHERE (meeting_link LIKE '%jit.si%' OR provider_room_id IS NULL)
            AND status IN ('pending', 'scheduled');
        `);

        const oldMeetings = result.rows;
        console.log(`✅ Found ${oldMeetings.length} meetings to migrate\n`);

        if (oldMeetings.length === 0) {
            console.log('🎉 No meetings to migrate!\n');
            await client.end();
            process.exit(0);
        }

        // Migrate each meeting
        console.log('2️⃣  Migrating meetings to Daily.co...\n');
        let updated = 0;
        let errors = 0;

        for (const meeting of oldMeetings) {
            try {
                // Generate new Daily.co room name
                const roomName = generateDailyRoomName(meeting.id);
                const dailyUrl = generateDailyUrl(roomName);

                // Update the meeting
                await client.query(
                    `UPDATE "MeetingSessions"
                     SET provider_room_id = $1, meeting_link = $2, video_provider = 'daily'
                     WHERE id = $3`,
                    [roomName, dailyUrl, meeting.id]
                );

                console.log(`✅ ${meeting.id}`);
                console.log(`   Room: ${roomName}`);
                console.log(`   URL: ${dailyUrl}\n`);
                updated++;

            } catch (err) {
                console.error(`❌ Failed to update ${meeting.id}: ${err.message}\n`);
                errors++;
            }
        }

        console.log(`\n📊 Migration Summary:`);
        console.log(`   ✅ Updated: ${updated}`);
        console.log(`   ❌ Errors: ${errors}`);
        console.log(`   Total: ${oldMeetings.length}\n`);

        // Verify migration
        console.log('3️⃣  Verifying migration...');
        const verifyResult = await client.query(`
            SELECT COUNT(*) as total,
                   COUNT(CASE WHEN provider_room_id IS NOT NULL THEN 1 END) as with_room_id,
                   COUNT(CASE WHEN video_provider = 'daily' THEN 1 END) as daily_provider
            FROM "MeetingSessions"
            WHERE status IN ('pending', 'scheduled', 'completed');
        `);

        const stats = verifyResult.rows[0];
        console.log(`✅ Total active meetings: ${stats.total}`);
        console.log(`✅ With provider_room_id: ${stats.with_room_id}`);
        console.log(`✅ Using Daily.co provider: ${stats.daily_provider}\n`);

        console.log('✅✅ Migration completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    } finally {
        await client.end();
    }
}

migrateOldMeetings();
