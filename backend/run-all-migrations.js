#!/usr/bin/env node

/**
 * Database Migration Runner
 * Executes SQL migration files in sequence
 */

const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');

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
        console.log(`\n${colors.cyan}${msg}${colors.reset}`);
        console.log(`${colors.cyan}${'='.repeat(msg.length)}${colors.reset}`);
    },
};

async function runMigrations() {
    try {
        log.header('Database Migration Runner');

        // Load config
        const configPath = path.join(__dirname, 'config', 'config.json');
        const config = require(configPath).development;

        // Create connection
        const sequelize = new Sequelize(config.database, config.username, config.password, {
            host: config.host,
            dialect: config.dialect,
            logging: false,
        });

        try {
            await sequelize.authenticate();
            log.success('Database connection established', `${config.host}/${config.database}`);
        } catch (err) {
            log.error('Database connection failed', err.message);
            process.exit(1);
        }

        // Get migration files (SQL only, sorted alphabetically)
        const migrationsDir = path.join(__dirname, 'migrations');
        const files = fs.readdirSync(migrationsDir)
            .filter(f => f.endsWith('.sql'))
            .sort();

        log.info(`Found ${files.length} SQL migration files`);

        // Run each migration
        let successCount = 0;
        let skipCount = 0;

        for (const file of files) {
            const filePath = path.join(migrationsDir, file);
            const sql = fs.readFileSync(filePath, 'utf8');

            try {
                console.log(`\nRunning: ${file}`);
                
                // Execute the SQL
                await sequelize.query(sql);
                
                log.success(`Completed: ${file}`);
                successCount++;
            } catch (err) {
                // Some migrations might fail if they already exist (IF NOT EXISTS)
                if (err.message.includes('already exists') || err.message.includes('duplicate')) {
                    log.warn(`Skipped: ${file}`, 'Already exists or already migrated');
                    skipCount++;
                } else {
                    log.error(`Failed: ${file}`, err.message);
                }
            }
        }

        log.header('Migration Summary');
        log.success(`${successCount} migrations completed`);
        if (skipCount > 0) {
            log.warn(`${skipCount} migrations skipped (already exist)`);
        }

        // Verify Feedbacks table exists
        log.info('\nVerifying Feedbacks table...');
        try {
            const result = await sequelize.query(`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' AND table_name = 'Feedbacks'
            `);

            if (result[0].length > 0) {
                log.success('Feedbacks table is now available!');
            } else {
                log.error('Feedbacks table was not created');
            }
        } catch (err) {
            log.error('Error verifying table', err.message);
        }

        await sequelize.close();
        
    } catch (error) {
        log.error('Unexpected error', error.message);
        console.error(error);
        process.exit(1);
    }
}

runMigrations();
