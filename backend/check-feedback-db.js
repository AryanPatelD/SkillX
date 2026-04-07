#!/usr/bin/env node

/**
 * Database Diagnostic Script for Feedback System
 * Checks:
 * 1. Database connection
 * 2. If Feedback table exists
 * 3. Feedback table structure
 * 4. Sample data from Feedback table
 * 5. Related Users and Sessions data
 */

const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// Color codes for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m',
};

const log = {
    success: (msg, details = '') => {
        console.log(`${colors.green}✓${colors.reset} ${msg}`);
        if (details) console.log(`  ${details}`);
    },
    error: (msg, details = '') => {
        console.log(`${colors.red}✗${colors.reset} ${msg}`);
        if (details) console.log(`  ${details}`);
    },
    info: (msg, details = '') => {
        console.log(`${colors.blue}ℹ${colors.reset} ${msg}`);
        if (details) console.log(`  ${details}`);
    },
    warn: (msg, details = '') => {
        console.log(`${colors.yellow}⚠${colors.reset} ${msg}`);
        if (details) console.log(`  ${details}`);
    },
    header: (msg) => {
        console.log(`\n${colors.cyan}${colors.reset} ${msg}`);
        console.log(`${colors.cyan}${'='.repeat(msg.length + 2)}${colors.reset}`);
    },
    table: (data) => {
        console.table(data);
    },
};

async function diagnostic() {
    try {
        log.header('Database Diagnostic - Feedback System');

        // Load config
        const configPath = path.join(__dirname, 'config', 'config.json');
        const config = require(configPath).development;

        // Test 1: Database Connection
        log.header('Test 1: Database Connection');
        const sequelize = new Sequelize(config.database, config.username, config.password, {
            host: config.host,
            dialect: config.dialect,
            logging: false,
        });

        try {
            await sequelize.authenticate();
            log.success('Database connection successful', `${config.host}/${config.database}`);
        } catch (err) {
            log.error('Database connection failed', err.message);
            process.exit(1);
        }

        // Test 2: Check if table exists
        log.header('Test 2: Checking Feedbacks Table');
        try {
            const result = await sequelize.query(`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_name = 'Feedbacks'
            `);

            if (result[0].length > 0) {
                log.success('Feedbacks table exists');
            } else {
                log.error('Feedbacks table does not exist!');
                log.info('Run migrations to create the table:', 'node backend/src/models/index.js');
            }
        } catch (err) {
            log.error('Error checking table existence', err.message);
        }

        // Test 3: Check table structure
        log.header('Test 3: Feedbacks Table Structure');
        try {
            const columns = await sequelize.query(`
                SELECT column_name, data_type, is_nullable, column_default
                FROM information_schema.columns
                WHERE table_name = 'Feedbacks'
                ORDER BY ordinal_position
            `);

            if (columns[0].length > 0) {
                log.success(`Found ${columns[0].length} columns`);
                const data = columns[0].map(col => ({
                    'Column Name': col.column_name,
                    'Data Type': col.data_type,
                    'Nullable': col.is_nullable,
                    'Default': col.column_default || 'None',
                }));
                log.table(data);
            } else {
                log.error('No columns found in Feedbacks table');
            }
        } catch (err) {
            log.error('Error checking table structure', err.message);
        }

        // Test 4: Check for records
        log.header('Test 4: Data in Feedbacks Table');
        try {
            const count = await sequelize.query(`SELECT COUNT(*) as count FROM "Feedbacks"`);
            const recordCount = parseInt(count[0][0].count);
            
            if (recordCount > 0) {
                log.success(`Found ${recordCount} feedback records`);

                // Get sample records
                const samples = await sequelize.query(`
                    SELECT 
                        id,
                        from_user_id,
                        to_user_id,
                        feedback_type,
                        rating,
                        comment,
                        "createdAt"
                    FROM "Feedbacks"
                    ORDER BY "createdAt" DESC
                    LIMIT 10
                `);

                if (samples[0].length > 0) {
                    log.info(`Showing latest ${Math.min(10, samples[0].length)} records:`);
                    const data = samples[0].map(row => ({
                        'ID': row.id.substring(0, 8) + '...',
                        'From': row.from_user_id.substring(0, 8) + '...',
                        'To': row.to_user_id.substring(0, 8) + '...',
                        'Type': row.feedback_type,
                        'Rating': row.rating,
                        'Comment': row.comment ? row.comment.substring(0, 30) + '...' : 'None',
                        'Created': new Date(row.createdAt).toLocaleString(),
                    }));
                    log.table(data);
                }
            } else {
                log.warn('No records found in Feedbacks table', 'Table is empty - this may be expected if no feedback has been submitted yet');
            }
        } catch (err) {
            log.error('Error checking for records', err.message);
        }

        // Test 5: Check Users table
        log.header('Test 5: Users Table');
        try {
            const userCount = await sequelize.query(`SELECT COUNT(*) as count FROM "Users"`);
            const count = parseInt(userCount[0][0].count);
            log.success(`Found ${count} users in the database`);

            if (count > 0) {
                const users = await sequelize.query(`
                    SELECT id, email, full_name, credits 
                    FROM "Users"
                    LIMIT 5
                `);
                log.info('Sample users:');
                const data = users[0].map(user => ({
                    'Name': user.full_name,
                    'Email': user.email,
                    'Credits': user.credits,
                    'ID': user.id.substring(0, 8) + '...',
                }));
                log.table(data);
            }
        } catch (err) {
            log.error('Error checking Users table', err.message);
        }

        // Test 6: Check MeetingSessions table
        log.header('Test 6: MeetingSessions Table');
        try {
            const sessionCount = await sequelize.query(`SELECT COUNT(*) as count FROM "MeetingSessions"`);
            const count = parseInt(sessionCount[0][0].count);
            
            if (count > 0) {
                log.success(`Found ${count} meeting sessions`);
            } else {
                log.warn('No meeting sessions found', 'Feedback can still be submitted without a session');
            }
        } catch (err) {
            log.error('Error checking MeetingSessions table', err.message);
        }

        // Test 7: Check constraints and indexes
        log.header('Test 7: Table Constraints & Indexes');
        try {
            const constraints = await sequelize.query(`
                SELECT constraint_name, constraint_type
                FROM information_schema.table_constraints
                WHERE table_name = 'Feedbacks'
            `);

            if (constraints[0].length > 0) {
                log.success(`Found ${constraints[0].length} constraints`);
                const data = constraints[0].map(c => ({
                    'Constraint': c.constraint_name,
                    'Type': c.constraint_type,
                }));
                log.table(data);
            }
        } catch (err) {
            log.error('Error checking constraints', err.message);
        }

        // Test 8: Check Feedback API route
        log.header('Test 8: Feedback API Routes');
        try {
            const routesPath = path.join(__dirname, 'src', 'routes', 'feedback.routes.js');
            const routes = require(routesPath);
            log.success('Feedback routes loaded successfully');
        } catch (err) {
            log.error('Error loading feedback routes', err.message);
        }

        log.header('Diagnostic Complete');
        log.info('Next Steps:');
        console.log('  1. If Feedbacks table is empty, submit a new feedback from the UI');
        console.log('  2. If getting 500 errors, check backend logs for detailed error messages');
        console.log('  3. Verify database user has permissions to read/write to the table');
        console.log('  4. Check if server is running and can connect to database\n');

        await sequelize.close();
    } catch (error) {
        log.error('Unexpected error', error.message);
        console.error(error);
    }
}

diagnostic();
