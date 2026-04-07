#!/usr/bin/env node

/**
 * Profile API Diagnostic Script
 * Tests the profile endpoints to identify issues
 */

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api';
let authToken = null;

// Color codes for console output
const colors = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
};

const log = {
    success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
    error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
    info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
    warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
};

async function test() {
    try {
        log.info('Starting Profile API Diagnostic...\n');

        // Test 1: Check if server is running
        log.info('Test 1: Checking if server is running...');
        try {
            const healthCheck = await axios.get(`${API_BASE}/auth/health`, { 
                timeout: 5000,
                validateStatus: () => true 
            });
            if (healthCheck.status === 200 || healthCheck.status === 404) {
                log.success('Server is running');
            } else {
                log.error(`Server responded with status ${healthCheck.status}`);
            }
        } catch (err) {
            log.error(`Server is not responding: ${err.message}`);
            log.info('Make sure backend server is running: cd backend && npm start');
            process.exit(1);
        }

        // Test 2: Try to login (you may need to adjust credentials)
        log.info('\nTest 2: Testing authentication...');
        log.warn('Note: This test uses demo credentials. Update them if needed.');
        
        try {
            const testEmail = process.env.TEST_EMAIL || 'test@example.com';
            const testPassword = process.env.TEST_PASSWORD || 'password123';
            
            const loginResponse = await axios.post(`${API_BASE}/auth/login`, {
                email: testEmail,
                password: testPassword,
            }, { validateStatus: () => true });

            if (loginResponse.status === 200 && loginResponse.data.token) {
                authToken = loginResponse.data.token;
                log.success(`Authentication successful. Token: ${authToken.substring(0, 20)}...`);
            } else if (loginResponse.status === 401) {
                log.warn('Invalid credentials. Using test token if available.');
                authToken = process.env.TEST_TOKEN;
                if (!authToken) {
                    log.error('No valid token. Please login first and set TEST_TOKEN env var.');
                    return;
                }
            } else {
                log.error(`Login failed with status ${loginResponse.status}: ${JSON.stringify(loginResponse.data)}`);
                return;
            }
        } catch (err) {
            log.error(`Login request failed: ${err.message}`);
            return;
        }

        // Test 3: Test profile endpoint
        log.info('\nTest 3: Testing GET /api/profile...');
        try {
            const profileResponse = await axios.get(`${API_BASE}/profile`, {
                headers: { Authorization: `Bearer ${authToken}` },
                validateStatus: () => true,
            });

            if (profileResponse.status === 200) {
                const profile = profileResponse.data;
                log.success(`Profile retrieved successfully`);
                log.info(`  User ID: ${profile.id}`);
                log.info(`  Name: ${profile.full_name}`);
                log.info(`  Email: ${profile.email}`);
                
                // Test 4: Test public profile endpoint
                log.info(`\nTest 4: Testing GET /api/profile/public/${profile.id}...`);
                try {
                    const publicProfileResponse = await axios.get(`${API_BASE}/profile/public/${profile.id}`, {
                        validateStatus: () => true,
                    });

                    if (publicProfileResponse.status === 200) {
                        log.success(`Public profile retrieved successfully`);
                        log.info(`  Ratings: ${publicProfileResponse.data.ratings?.averageRating || 0}/5`);
                        log.info(`  Total Feedbacks: ${publicProfileResponse.data.ratings?.totalFeedbacks || 0}`);
                    } else {
                        log.error(`Public profile request failed with status ${publicProfileResponse.status}`);
                        log.error(`Response: ${JSON.stringify(publicProfileResponse.data)}`);
                    }
                } catch (err) {
                    log.error(`Public profile request failed: ${err.message}`);
                }
            } else if (profileResponse.status === 401) {
                log.error('Unauthorized: Token may be invalid or expired');
            } else {
                log.error(`Profile request failed with status ${profileResponse.status}`);
                log.error(`Response: ${JSON.stringify(profileResponse.data)}`);
            }
        } catch (err) {
            log.error(`Profile request failed: ${err.message}`);
        }

        log.info('\n✓ Diagnostic complete');
    } catch (error) {
        log.error(`Unexpected error: ${error.message}`);
    }
}

test();
