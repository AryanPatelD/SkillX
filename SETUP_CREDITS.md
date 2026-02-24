# Implementation Quick Start

## What Changed?

A complete **Credits System** has been added to the Skill Exchange application. Users now:
1. Get 10 credits when they register
2. Spend 5 credits to book learning sessions
3. Earn credits when tutors accept their sessions

## Database Setup (Important!)

### For New Deployments
The database schema already includes the credits column. No action needed.

### For Existing Databases
Run this migration to add credits to your existing database:

```bash
# Using psql directly
psql -U your_postgres_user -d your_database_name < backend/migrations/001_add_credits_to_users.sql

# Or manually execute in your database client:
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 0;
UPDATE "Users" SET credits = 10;
```

## Backend Changes Summary

### Files Modified:
1. **backend/schema.sql** - Added credits column to Users table
2. **backend/src/models/user.model.js** - Added credits field to User model
3. **backend/src/controllers/auth.controller.js** - Register now gives 10 credits, login returns credits
4. **backend/src/controllers/session.controller.js** - Added credit validation and transfers

### Key Logic:
- Users get 10 credits on registration
- Session booking requires 5 credits minimum
- Credits transfer happens when tutor accepts session (status → "Confirmed")

## Frontend Changes Summary

### Main Components Updated:
1. **Navbar** - Shows current credits balance
2. **BookSession** - Credit requirements, limits button if insufficient
3. **Profile** - Dedicated credits card display
4. **MySessions** - Credit transfer information
5. **RequestHelp** - Completely redesigned with better UX

### New Features:
- Visual credit display in navbar (coin icon + amount)
- Credit warning on session booking
- Enhanced skill request form with urgency levels
- Credit transfer confirmations

## Installation Steps

### 1. Database Update (if needed)
```bash
cd backend
psql -U postgres -d skill_exchange < migrations/001_add_credits_to_users.sql
```

### 2. Backend - No action needed
All backend changes are code-based, already in place.

### 3. Frontend - No action needed
All frontend changes are code-based, already in place.

### 4. Restart Services
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

## Testing the Feature

### Test 1: New User Registration
1. Register a new account
2. Check profile - should show 10 credits
3. Verify navbar displays credits

### Test 2: Session Booking with Credits
1. Login as User A (has credits)
2. Go to "Book Session"
3. Select tutor and schedule
4. Should succeed if 5+ credits
5. User A should still have credits until tutor accepts

### Test 3: Credit Transfer on Acceptance
1. Login as User B (tutor)
2. Go to "My Sessions"
3. See pending session from User A
4. Click "Accept"
5. Login as User A
6. Credits should be reduced by 5
7. Login as User B
8. Credits should be increased by 5

### Test 4: Insufficient Credits
1. Create new user (starts with 10)
2. Book 2 sessions (depletes to 0)
3. Try to book third session
4. Should see "Insufficient credits" error
5. Button should be disabled

### Test 5: Skill Request Form
1. Go to "Request Help"
2. Fill in all fields including new "Title" field
3. Select urgency level
4. Submit
5. Should succeed with success message

## Important Files

```
backend/
├── schema.sql                          (credits column added)
├── migrations/
│   └── 001_add_credits_to_users.sql   (NEW - migration file)
└── src/
    ├── models/
    │   └── user.model.js              (credits field added)
    ├── controllers/
    │   ├── auth.controller.js         (register/login updated)
    │   └── session.controller.js      (credit transfers added)

frontend/
└── src/
    ├── components/
    │   └── Navbar.jsx                 (credits display added)
    └── pages/
        ├── BookSession.jsx            (credit validation added)
        ├── Profile.jsx                (credits card added)
        ├── MySessions.jsx             (credit info added)
        └── RequestHelp.jsx            (completely redesigned)

Documentation:
├── CREDITS_SYSTEM.md                  (Detailed feature docs)
└── SETUP.md                           (This file)
```

## Troubleshooting

### Issue: Credits not showing in navbar
**Solution**: 
- Reload page
- Clear browser cache
- Check that user.credits is in login response

### Issue: Can't book session (credit error)
**Solution**:
- Ensure user has 5+ credits
- Refresh to get updated credits
- Check browser console for errors

### Issue: Database column doesn't exist
**Solution**:
- Run the migration: `psql -U user -d db < backend/migrations/001_add_credits_to_users.sql`
- Restart backend

## API Endpoint Changes

All existing endpoints work the same, with these additions:

```
POST /auth/register    → Now grants 10 credits
POST /auth/login       → Now returns credits field
POST /sessions/request → Now validates 5 credit minimum
PUT /sessions/:id/status → Now handles credit transfers when accepted
```

See `CREDITS_SYSTEM.md` for full API documentation.

## Questions?

- Check `CREDITS_SYSTEM.md` for detailed documentation
- Review code comments in modified files
- Check browser console for errors
- Review API responses for error details

Enjoy the credits system! 🎉
