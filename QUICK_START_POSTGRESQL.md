# 🚀 Quick Start Guide - PostgreSQL Migration

## What Was Done ✨

The SkillX Meeting Link has been **successfully converted to PostgreSQL** with full integration to your main backend!

### Key Accomplishments

| Component | Status | Location |
|-----------|--------|----------|
| **Database Schema** | ✅ Created | `backend/migrations/006_create_meeting_sessions.sql` |
| **Sequelize Model** | ✅ Created | `backend/src/models/meetingSession.model.js` |
| **API Controller** | ✅ Created | `backend/src/controllers/meetingSession.controller.js` |
| **Routes** | ✅ Created | `backend/src/routes/meetingSession.routes.js` |
| **Express Server** | ✅ Created | `SkillX Meeting link/server-postgresql.js` |
| **Backend Integration** | ✅ Updated | `backend/src/app.js` & `models/index.js` |
| **Configuration** | ✅ Created | `SkillX Meeting link/.env.example` |
| **Documentation** | ✅ Complete | All files with detailed guides |

---

## 🎯 Benefits

### Before (MongoDB)
❌ Separate database to manage  
❌ Limited referential integrity  
❌ Different ORM (Mongoose vs Sequelize)  
❌ Extra deployment complexity  

### After (PostgreSQL)
✅ **Single unified database**  
✅ **Full referential integrity** (FK constraints)  
✅ **Same ORM** (Sequelize for everything)  
✅ **Simpler deployment** (1 db instead of 2)  
✅ **Better consistency** (ACID transactions)  

---

## ⚡ Quick Start (5 Minutes)

### 1. Install Dependencies

```bash
cd "SkillX Meeting link"
npm install
```

### 2. Setup Database

```bash
# Option A: Using psql command line
psql -U postgres -d skillx_db -f ../backend/migrations/006_create_meeting_sessions.sql

# Option B: Using pgAdmin or DBeaver
# 1. Open your PostgreSQL client
# 2. Connect to skillx_db
# 3. Run the SQL from: backend/migrations/006_create_meeting_sessions.sql
```

### 3. Configure Environment

```bash
# Copy template
cp .env.example .env

# Edit .env with your database credentials
# DB_HOST=localhost
# DB_USER=postgres
# DB_PASS=your_password
# DB_NAME=skillx_db
```

### 4. Start Server

```bash
npm start

# Output should show:
# ✅ PostgreSQL database connected
# 🚀 Meeting Link Backend running on port 3001
```

### 5. Test It

```bash
# Create a test session
curl -X POST http://localhost:3001/api/sessions \
  -H "Content-Type: application/json" \
  -d '{
    "learnerName": "Test User",
    "slots": [
      {"date": "2026-04-15", "startTime": "10:00", "endTime": "11:00"}
    ]
  }'

# Should return: JSON with session details ✅
```

---

## 📊 Database Schema

One new table created in your PostgreSQL database:

```
MeetingSessions (UUID, learner_name, status, slots, meeting_link, ...)
                ↓
           Indexes for fast queries (status, tutor_id, learner_id, createdAt)
```

---

## 🔗 Integration Options

### Option A: Use Main Backend (Recommended)

```bash
# Run main backend
cd backend
npm run dev
# On: http://localhost:5000

# Meeting Link routes available at:
# http://localhost:5000/api/meeting/api/sessions

# Update frontend:
# Change localhost:3000 → localhost:5000/api/meeting
```

### Option B: Run Standalone

```bash
# Start independently
cd "SkillX Meeting link"
npm start
# On: http://localhost:3001

# Frontend keeps using:
# http://localhost:3001/api/sessions
```

---

## 📁 Files Overview

```
backend/
├── migrations/
│   └── 006_create_meeting_sessions.sql    ← Run this first
├── src/
│   ├── models/
│   │   ├── meetingSession.model.js        ← New model
│   │   └── index.js                       ← Updated with MeetingSession
│   ├── controllers/
│   │   └── meetingSession.controller.js   ← New controller
│   ├── routes/
│   │   └── meetingSession.routes.js       ← New routes
│   └── app.js                             ← Updated with routes
│
SkillX Meeting link/
├── server-postgresql.js                   ← New PostgreSQL server
├── server.js                              ← Legacy (keep for reference)
├── .env.example                           ← Copy to .env
├── package.json                           ← Updated dependencies
├── README-PostgreSQL.md                   ← Complete documentation
└── learner.html & tutor.html              ← Works with both setups
```

---

## 🧪 API Endpoints

All endpoints return JSON and maintain **100% backward compatibility** with the old MongoDB version:

```javascript
// No changes needed for frontend!

// 1. Learner submits slots
POST /api/sessions
{ "learnerName": "John", "slots": [...] }

// 2. Tutor fetches pending sessions
GET /api/sessions

// 3. Tutor confirms a slot
PUT /api/sessions/confirm
{ "slot": {...} }

// New endpoints (optional):
GET /api/sessions/:id           // Get specific session
GET /api/sessions/all           // Get all sessions
PUT /api/sessions/:id/complete  // Mark completed
DELETE /api/sessions/:id        // Cancel session
```

---

## 🆘 Troubleshooting

### Error: "ENUM type does not exist"
```bash
# Solution: Run the migration script
psql -U postgres -d skillx_db -f backend/migrations/006_create_meeting_sessions.sql
```

### Error: "Cannot find module 'pg'"
```bash
# Solution: Install dependencies
cd "SkillX Meeting link"
npm install
```

### Error: Database connection refused
```bash
# Solution: Check PostgreSQL is running
# Windows: Check Services → PostgreSQL
# Mac: brew services list
# Linux: sudo systemctl status postgresql

# Also verify .env credentials are correct
```

---

## 📚 Documentation

For detailed information:

1. **Setup & Installation**: [README-PostgreSQL.md](./SkillX%20Meeting%20link/README-PostgreSQL.md)
2. **Conversion Details**: [MEETING_LINK_CONVERSION.md](./MEETING_LINK_CONVERSION.md)
3. **API Reference**: [README-PostgreSQL.md - API Endpoints](./SkillX%20Meeting%20link/README-PostgreSQL.md#-api-endpoints)
4. **Integration Guide**: [MEETING_LINK_CONVERSION.md - Integration Points](./MEETING_LINK_CONVERSION.md#-integration-points)

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] npm install completed without errors
- [ ] Migration SQL executed successfully
- [ ] .env file created and configured
- [ ] Server starts and shows "PostgreSQL database connected"
- [ ] `npm start` runs without errors
- [ ] `/test` endpoint returns "Meeting Link Backend is working"
- [ ] POST /api/sessions creates a new session
- [ ] GET /api/sessions returns session data
- [ ] PUT /api/sessions/confirm confirms a slot and generates meeting link
- [ ] Frontend can connect to API

---

## 🎉 You're All Set!

The Meeting Link is now running on:
- **Standalone**: http://localhost:3001
- **Via Main Backend**: http://localhost:5000/api/meeting

Your single PostgreSQL database handles:
- ✅ Main SkillX application
- ✅ User management
- ✅ Skills and requests
- ✅ Quiz data
- ✅ Meeting sessions (NEW!)

**No more separate databases to manage!** 🎊

---

**Questions?** Check:
1. README-PostgreSQL.md (comprehensive guide)
2. MEETING_LINK_CONVERSION.md (migration details)
3. backend/migrations/006_create_meeting_sessions.sql (schema)
