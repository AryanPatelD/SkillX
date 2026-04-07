# 📋 File Checklist - What to Do Next

## ✅ Completed Conversion Files

### Step 1: Install & Configure (5 min)

| File | Action | Location |
|------|--------|----------|
| `package.json` | ✅ **Update** - Run `npm install` | `SkillX Meeting link/` |
| `.env.example` | ✅ **Copy** - Copy to `.env` & edit | `SkillX Meeting link/` |
| `-` | ⚙️ **Edit** - Set DB credentials | `SkillX Meeting link/.env` |

**Commands:**
```bash
cd "SkillX Meeting link"
npm install
cp .env.example .env
# Edit .env with your database credentials
```

---

### Step 2: Database Setup (3 min)

| File | Action | Location |
|------|--------|----------|
| `006_create_meeting_sessions.sql` | 🗄️ **Execute** - Run in PostgreSQL | `backend/migrations/` |

**Commands:**
```bash
# Option A: Command line
psql -U postgres -d skillx_db -f backend/migrations/006_create_meeting_sessions.sql

# Option B: Using pgAdmin or DBeaver
# Open PostgreSQL client → connect to skillx_db → copy & paste SQL → run
```

---

### Step 3: Verify Backend Files (Nothing to do - already integrated)

| File | Status | Location |
|------|--------|----------|
| `meetingSession.model.js` | ✅ Created | `backend/src/models/` |
| `meetingSession.controller.js` | ✅ Created | `backend/src/controllers/` |
| `meetingSession.routes.js` | ✅ Created | `backend/src/routes/` |
| `models/index.js` | ✅ Updated | `backend/src/models/` |
| `app.js` | ✅ Updated | `backend/src/` |

**Status:** All backend files are ready to use. No action needed.

---

### Step 4: Start Server

| File | Action | Location |
|------|--------|----------|
| `server-postgresql.js` | 🚀 **Run** - Start server | `SkillX Meeting link/` |

**Commands:**
```bash
# Option A: Standalone (if running separately)
cd "SkillX Meeting link"
npm start              # Runs on port 3001

# Option B: Via Main Backend (recommended)
cd backend
npm run dev            # Runs on port 5000

# Option C: Development with auto-reload
npm run dev            # Uses nodemon
```

---

### Step 5: Test Endpoints

| Action | Command |
|--------|---------|
| 🧪 **Test** | curl http://localhost:3001/test |
| 📝 **Create** | POST /api/sessions with JSON |
| 📖 **Read** | GET /api/sessions |
| ✏️ **Confirm** | PUT /api/sessions/confirm |

**Test Script:**
```bash
# Create session
curl -X POST http://localhost:3001/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"learnerName":"Test","slots":[{"date":"2026-04-15","startTime":"10:00","endTime":"11:00"}]}'

# Expected response: JSON with session data ✅
```

---

## 📖 Documentation Files You Should Read

### Mandatory (Start Here)

| Document | Purpose | Time | Location |
|----------|---------|------|----------|
| **QUICK_START_POSTGRESQL.md** | 5-minute setup | ⚡ 5 min | Root folder |
| **README-PostgreSQL.md** | Complete guide | 📚 30 min | `SkillX Meeting link/` |

### Optional (For Reference)

| Document | Purpose | Time | Location |
|----------|---------|------|----------|
| MEETING_LINK_CONVERSION.md | Detailed conversion | 📖 20 min | Root folder |
| MIGRATION_COMPLETE.md | Summary report | 📊 10 min | Root folder |
| This file | Setup checklist | ✓ 5 min | Root folder |

---

## 🗄️ Database Files

| File | Purpose | Action |
|------|---------|--------|
| `006_create_meeting_sessions.sql` | Schema & indexes | 🔴 **MUST RUN** |

**Single command to execute:**
```sql
-- Paste this entire file into PostgreSQL client:
CREATE TABLE IF NOT EXISTS "MeetingSessions" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learner_name VARCHAR(255) NOT NULL,
    tutor_id UUID REFERENCES "Users"(id) ON DELETE SET NULL,
    learner_id UUID REFERENCES "Users"(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'scheduled', 'completed', 'cancelled')),
    confirmed_slot JSONB,
    proposed_slots JSONB,
    meeting_link VARCHAR(500),
    "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_meeting_sessions_status ON "MeetingSessions"(status);
CREATE INDEX idx_meeting_sessions_tutor_id ON "MeetingSessions"(tutor_id);
CREATE INDEX idx_meeting_sessions_learner_id ON "MeetingSessions"(learner_id);
CREATE INDEX idx_meeting_sessions_created_at ON "MeetingSessions"("createdAt");
```

---

## 🎯 Quick Decision: How to Run?

### Integration Mode (Recommended)
```
Use when: Running entire SkillX application
Start: cd backend && npm run dev
Access: http://localhost:5000/api/meeting/api/sessions
Database: Shared (PostgreSQL)
```

### Standalone Mode
```
Use when: Testing Meeting Link separately
Start: cd "SkillX Meeting link" && npm start
Access: http://localhost:3001/api/sessions
Database: Shared (PostgreSQL)
```

### Legacy Mode (Not Recommended)
```
Use when: Reference/testing in-memory version
Start: cd "SkillX Meeting link" && npm run legacy
Access: http://localhost:3000/api/sessions
Database: In-Memory (data lost on restart!)
```

---

## ⚠️ Important: Checklist Before Starting

- [ ] PostgreSQL service is running
- [ ] `npm install` completed in Meeting Link folder
- [ ] `.env` file created and filled with DB credentials
- [ ] Migration SQL executed in database
- [ ] All dependencies installed
- [ ] No port conflicts (5000, 3001 available)

---

## 🚀 Complete Setup (Copy-Paste Commands)

```bash
# 1. Navigate to Meeting Link folder
cd "d:\Sem-4\SkillX\SkillX Meeting link"

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env

# Edit .env with your credentials (use notepad or VS Code)
# - DB_HOST: localhost
# - DB_NAME: skillx_db
# - DB_USER: postgres
# - DB_PASS: your_postgres_password

# 4. Run database migration (in new terminal)
psql -U postgres -d skillx_db -f ..\backend\migrations\006_create_meeting_sessions.sql

# 5. Start server (back in Meeting Link terminal)
npm start

# 6. Test in another terminal
curl http://localhost:3001/test

# Expected output: "Meeting Link Backend is working"
```

---

## ✅ Success Criteria

Your setup is successful when:

- ✅ `npm install` completes without errors
- ✅ PostgreSQL migration runs without errors
- ✅ Server starts with message: "✅ PostgreSQL database connected"
- ✅ `/test` endpoint returns: "Meeting Link Backend is working"
- ✅ `POST /api/sessions` creates a session
- ✅ `GET /api/sessions` returns session data
- ✅ `PUT /api/sessions/confirm` generates meeting link

---

## 🆘 Troubleshooting Quick Links

| Problem | Solution | Details |
|---------|----------|---------|
| ENUM error | Run migration | See: 006_create_meeting_sessions.sql |
| Connection refused | Check .env & PostgreSQL | See: README-PostgreSQL.md |
| Module not found | Run npm install | Check: SkillX Meeting link folder |
| Port in use | Kill process or change port | Update: MEETING_PORT in .env |
| Database not found | Create skillx_db | See: Main backend README |

---

## 📞 File Structure Reference

```
d:\Sem-4\SkillX\
├── README.md                           ← Main project readme
├── QUICK_START_POSTGRESQL.md           ← START HERE ⭐
├── MEETING_LINK_CONVERSION.md          ← Detailed guide
├── MIGRATION_COMPLETE.md               ← Summary
├── FILES_CHECKLIST.md                  ← YOU ARE HERE
│
├── backend/
│   ├── migrations/
│   │   └── 006_create_meeting_sessions.sql    ← RUN THIS
│   ├── src/
│   │   ├── models/
│   │   │   └── meetingSession.model.js        ← NEW
│   │   ├── controllers/
│   │   │   └── meetingSession.controller.js   ← NEW
│   │   ├── routes/
│   │   │   └── meetingSession.routes.js       ← NEW
│   │   └── app.js                             ← UPDATED
│   └── package.json                           ← UPDATED
│
└── SkillX Meeting link/
    ├── server-postgresql.js              ← NEW SERVER
    ├── server.js                         ← LEGACY
    ├── package.json                      ← UPDATED
    ├── .env.example                      ← CONFIG TEMPLATE
    ├── .env                              ← CREATE THIS
    ├── README-PostgreSQL.md              ← DOCUMENTATION
    ├── learner.html                      ← NO CHANGES (compatible)
    └── tutor.html                        ← NO CHANGES (compatible)
```

---

## 📋 Setup Checklist Template

Copy & paste this for tracking:

```
SETUP CHECKLIST - SkillX Meeting Link PostgreSQL
================================================

Prerequisites:
 [ ] PostgreSQL installed & running
 [ ] Node.js 14+ installed
 [ ] Git/Version control setup
 [ ] Text editor ready

Installation:
 [ ] npm install in Meeting Link folder
 [ ] .env.example → .env
 [ ] Edit .env with credentials

Database:
 [ ] Migration SQL executed
 [ ] Tables visible in pgAdmin/DBeaver
 [ ] Can connect from Node.js

Server:
 [ ] npm start runs without errors
 [ ] "✅ PostgreSQL database connected" appears
 [ ] /test endpoint responds

Testing:
 [ ] POST /api/sessions creates session
 [ ] GET /api/sessions returns data
 [ ] PUT /api/sessions/confirm works
 [ ] Meeting link generated

Frontend:
 [ ] learner.html loads
 [ ] tutor.html loads
 [ ] API endpoints reachable
 [ ] Session flow works

Documentation:
 [ ] README-PostgreSQL.md read
 [ ] API endpoints understood
 [ ] Troubleshooting guide reviewed

Deployment (Optional):
 [ ] Environment variables set
 [ ] Database backed up
 [ ] Deployment scripts ready
 [ ] Monitoring configured
```

---

## 🎯 Final Step: Let's Verify Everything

After setup, run this verification:

```bash
# 1. Test database connection
psql -U postgres -c "SELECT version();"

# 2. Check tables created
psql -U postgres -d skillx_db -c "SELECT * FROM information_schema.tables WHERE table_name = 'MeetingSessions';"

# 3. Start server
npm start

# 4. In another terminal, test API
curl -X POST http://localhost:3001/api/sessions \
  -H "Content-Type: application/json" \
  -d '{"learnerName":"Verification User","slots":[{"date":"2026-04-15","startTime":"10:00","endTime":"11:00"}]}'

# 5. Check response - should have session data with ID ✅
```

---

## 🎉 You're Ready!

All files are in place. Now you're ready to:

1. ✅ Install dependencies
2. ✅ Run database migration
3. ✅ Configure environment
4. ✅ Start the server
5. ✅ Test the API
6. ✅ Deploy to production

---

**Questions?** Read the corresponding documentation file in the checklist above.

**Ready to start?** Follow the "Complete Setup" section with copy-paste commands.

**Good luck!** 🚀
