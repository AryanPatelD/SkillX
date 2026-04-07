const api = require('./src/config/database');
const express = require('express');
const app = express();

// Setup Express
app.use(express.json());

// Import routes
const searchRoutes = require('./src/routes/search.routes');

app.use('/api/search', searchRoutes);

// Start server and test
const PORT = 3001;
app.listen(PORT, async () => {
    console.log(`✅ Test server running on http://localhost:${PORT}`);
    
    // Wait a moment for server to be ready
    setTimeout(async () => {
        try {
            const fetch = (await import('node-fetch')).default;
            
            // Test skills endpoint
            console.log('\n📍 Testing /api/search/skills');
            const skillsRes = await fetch(`http://localhost:${PORT}/api/search/skills`);
            const skillsData = await skillsRes.json();
            console.log(`Status: ${skillsRes.status}`);
            console.log(`Found: ${skillsData.length} skills`);
            if (skillsData.length > 0) {
                skillsData.forEach(s => {
                    console.log(`  - ${s.name} (Category: ${s.category})`);
                    if (s.providers?.length > 0) {
                        s.providers.forEach(p => console.log(`      Provider: ${p.full_name}`));
                    }
                });
            }

            // Test requests endpoint
            console.log('\n📍 Testing /api/search/requests');
            const requestsRes = await fetch(`http://localhost:${PORT}/api/search/requests`);
            const requestsData = await requestsRes.json();
            console.log(`Status: ${requestsRes.status}`);
            console.log(`Found: ${requestsData.length} requests`);
            if (requestsData.length > 0) {
                requestsData.forEach(r => {
                    console.log(`  - ${r.skill?.name} requested by ${r.requester?.full_name}`);
                });
            }

            process.exit(0);
        } catch (error) {
            console.error('Error:', error);
            process.exit(1);
        }
    }, 1000);
});
