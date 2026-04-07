# SkillX Meeting Link - PostgreSQL Edition

A session scheduling system for SkillX that uses PostgreSQL with Sequelize ORM, fully integrated with the main SkillX backend database.

## 🎯 Features

- ✅ Learners propose multiple time slots
- ✅ Tutors review and confirm slots
- ✅ Auto-generated meeting links (Jitsi)
- ✅ PostgreSQL database integration
- ✅ Sequelize ORM for data consistency
- ✅ Full referential integrity with Users table
- ✅ RESTful API design

## 📋 Prerequisites

- Node.js 14+ and npm
- PostgreSQL 12+
- Same PostgreSQL database as main SkillX backend

## 🚀 Setup

### 1. Install Dependencies

```bash
cd "SkillX Meeting link"
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Then edit `.env` with your PostgreSQL credentials:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=skillx_db
DB_USER=postgres
DB_PASS=your_password

MEETING_PORT=3001
```

### 3. Run Database Migration

The migration file is located at `backend/migrations/006_create_meeting_sessions.sql`

Connect to PostgreSQL and run:

```bash
# Using psql
psql -U postgres -d skillx_db -f ../backend/migrations/006_create_meeting_sessions.sql
```

Or execute the SQL directly in your PostgreSQL client:

```sql
-- Creates MeetingSessions table with proper indexing
```

### 4. Start the Server

**Development mode with auto-reload:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will start on port 3001 (configurable via `MEETING_PORT` in `.env`)

**Test endpoint:**
```bash
curl http://localhost:3001/test
# Response: "Meeting Link Backend is working"
```

## 📡 API Endpoints

All endpoints accept JSON and return JSON.

### Create Session (Learner)
```http
POST /api/sessions
Content-Type: application/json

{
  "learnerName": "John Doe",
  "slots": [
    { "date": "2026-04-15", "startTime": "10:00", "endTime": "11:00" },
    { "date": "2026-04-16", "startTime": "14:00", "endTime": "15:00" },
    { "date": "2026-04-17", "startTime": "16:00", "endTime": "17:00" }
  ]
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "learner_name": "John Doe",
  "status": "pending",
  "proposed_slots": [...],
  "createdAt": "2026-04-01T10:30:00.000Z",
  "updatedAt": "2026-04-01T10:30:00.000Z"
}
```

### Get Pending Sessions (Tutor)
```http
GET /api/sessions
```

**Response:** Returns first pending session or null

### Confirm Slot (Tutor)
```http
PUT /api/sessions/confirm
Content-Type: application/json

{
  "slot": { "date": "2026-04-15", "startTime": "10:00", "endTime": "11:00" },
  "sessionId": "550e8400-e29b-41d4-a716-446655440000"  // optional
}
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "learner_name": "John Doe",
  "status": "scheduled",
  "confirmed_slot": { "date": "2026-04-15", "startTime": "10:00", "endTime": "11:00" },
  "meeting_link": "https://meet.jit.si/SkillExchange-abc-def123-ghi",
  "updatedAt": "2026-04-01T10:35:00.000Z"
}
```

### Get Specific Session
```http
GET /api/sessions/:id
```

### Get All Sessions
```http
GET /api/sessions/all
```

## 🗄️ Database Schema

### MeetingSessions Table

```sql
CREATE TABLE "MeetingSessions" (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_name VARCHAR(255) NOT NULL,
  tutor_id UUID REFERENCES "Users"(id),
  learner_id UUID REFERENCES "Users"(id),
  status ENUM('pending', 'scheduled', 'completed', 'cancelled'),
  confirmed_slot JSONB,
  proposed_slots JSONB,
  meeting_link VARCHAR(500),
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW()
);
```

### Indexes

- `idx_meeting_sessions_status` on status
- `idx_meeting_sessions_tutor_id` on tutor_id
- `idx_meeting_sessions_learner_id` on learner_id
- `idx_meeting_sessions_created_at` on createdAt

## 🔗 Integration with Main Backend

The Meeting Link module is fully integrated with the main SkillX backend:

1. **Shared Database**: Uses the same PostgreSQL database as the main backend
2. **Sequelize Models**: Includes MeetingSession model with User associations
3. **Shared Routes**: Routes available at `/api/meeting/*` in main backend
4. **Unified ORM**: Uses Sequelize for consistent data handling

### Files Added to Main Backend

- `backend/src/models/meetingSession.model.js` - Sequelize model
- `backend/src/controllers/meetingSession.controller.js` - Controller logic
- `backend/src/routes/meetingSession.routes.js` - Route definitions
- `backend/migrations/006_create_meeting_sessions.sql` - Database migration

### Main Backend Integration

In `backend/src/app.js`, the routes are registered:

```javascript
const meetingSessionRoutes = require('./routes/meetingSession.routes');
app.use('/api/meeting', meetingSessionRoutes);
```

## 🎨 Frontend Integration

Update frontend API URLs from:

```javascript
// Old (localhost:3000 or MongoDB)
fetch('http://127.0.0.1:3000/api/sessions')

// New (integrated in main backend)
fetch('http://localhost:5000/api/meeting/api/sessions')
// or if running standalone
fetch('http://localhost:3001/api/sessions')
```

### For Learner Portal (`learner.html`)

```javascript
const API_URL = 'http://localhost:3001'; // Or main backend URL

// Create session
fetch(`${API_URL}/api/sessions`, { method: 'POST', ... })

// Check status
fetch(`${API_URL}/api/sessions`, { method: 'GET' })
```

### For Tutor Dashboard (`tutor.html`)

```javascript
const API_URL = 'http://localhost:3001'; // Or main backend URL

// Load pending sessions
fetch(`${API_URL}/api/sessions`, { method: 'GET' })

// Confirm slot
fetch(`${API_URL}/api/sessions/confirm`, { method: 'PUT', ... })
```

## 🚀 Running Both Backends

### Option 1: Standalone Mode
- Main Backend: `npm start` (port 5000)
- Meeting Link: `npm start` (port 3001)

### Option 2: Via Main Backend
- Integrated routes available at: `http://localhost:5000/api/meeting/*`
- Run only main backend: `npm start` (port 5000)

## 🔄 Migration from MongoDB

If you were using the MongoDB version (`skill-exchange-backend`), here's the data migration:

```javascript
// All existing data is lost (MongoDB ↔ PostgreSQL incompatible)
// Start fresh with the new PostgreSQL schema
```

## 📊 Troubleshooting

### Connection refused on port 3001
- Check if `MEETING_PORT` is set in `.env`
- Ensure no other process is using port 3001

### Database connection failed
- Verify PostgreSQL is running: `pg_isready -h localhost`
- Check DB credentials in `.env`
- Ensure database exists: `psql -l`

### JSONB data not appearing
- PostgreSQL version must be 9.4+ for JSONB support
- Check migration ran successfully

## 🛠️ Development

### Run with hot-reload
```bash
npm run dev
```

### View database schema
```bash
psql -U postgres -d skillx_db -c "\dt"
```

### Clear all sessions (for testing)
```sql
TRUNCATE TABLE "MeetingSessions" CASCADE;
```

## 📝 License

ISC

## 🤝 Support

For issues or questions, refer to the main SkillX backend documentation.
