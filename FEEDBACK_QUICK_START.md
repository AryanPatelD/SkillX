# 🚀 Feedback System - Implementation Checklist

## Phase 1: Database Setup

- [ ] Navigate to `backend/` directory
- [ ] Open `migrations/008_create_feedback_table.sql`
- [ ] Run the migration on your database:
  ```bash
  psql -U postgres -d skillx -f backend/migrations/008_create_feedback_table.sql
  ```
- [ ] Verify table created:
  ```bash
  psql -d skillx -c "\\dt Feedbacks"
  ```

## Phase 2: Backend Verification

- [ ] Check `backend/src/models/index.js` - Feedback model should be imported
- [ ] Check `backend/src/app.js` - Feedback routes should be registered
- [ ] Verify no syntax errors:
  ```bash
  cd backend
  npm start
  ```
- [ ] Server should start without errors
- [ ] Look for message: "SSEMS Backend is running"

## Phase 3: Frontend Check

- [ ] Verify all new components exist:
  - [ ] `frontend/src/components/FeedbackForm.jsx`
  - [ ] `frontend/src/components/RatingDisplay.jsx`
  - [ ] `frontend/src/components/UserFeedback.jsx`
  - [ ] `frontend/src/pages/UserFeedbackPage.jsx`

- [ ] Check imports in modified files:
  - [ ] Profile.jsx imports: `RatingDisplay`, `UserFeedback`
  - [ ] MeetingRoom.jsx imports: `FeedbackForm`
  - [ ] App.jsx imports: `UserFeedbackPage`

- [ ] Start frontend:
  ```bash
  cd frontend
  npm run dev
  ```

## Phase 4: Integration Verification

### Check Meeting Data Structure
- [ ] Meeting passed to MeetingRoom includes:
  - [ ] `id` (session ID)
  - [ ] `tutor_id` (tutor user ID)
  - [ ] `learner_id` (learner user ID)
  - [ ] `meeting_link` (video URL)

### Update Meeting Endpoints (If Needed)
If meeting data doesn't include user IDs:
- [ ] Update backend meeting controller to include these fields
- [ ] Ensure associations are included in findAll/findByPk queries
- [ ] Test with curl/Postman that IDs are returned

## Phase 5: Feature Testing

### Test 1: Profile Display
- [ ] Go to `/profile`
- [ ] Should see "My Rating & Reviews" section
- [ ] Should see "Recent Feedback" section
- [ ] Star display visible (even if 0 rating)

### Test 2: Feedback Page
- [ ] Navigate to `/feedback/some-user-id`
- [ ] Page loads without errors
- [ ] Shows rating and feedback list

### Test 3: Meeting & Feedback Flow
- [ ] Schedule/join a test meeting
- [ ] Click "End Meeting" button
- [ ] Feedback form should appear (or you see redirect if no IDs)
- [ ] Select star rating
- [ ] Optionally enter comment
- [ ] Click "Submit Feedback"
- [ ] Should see success message
- [ ] Eventually redirect to dashboard

### Test 4: Feedback Persistence
- [ ] Go back to user's profile
- [ ] Check if new feedback appears
- [ ] Check if average rating updated

## Phase 6: API Testing

### Using curl or Postman

```bash
# Test 1: Get user rating
curl "http://localhost:5000/api/feedback/rating/USER_ID"

# Test 2: Get received feedback
curl "http://localhost:5000/api/feedback/received/USER_ID"

# Test 3: Submit feedback (requires auth token)
curl -X POST "http://localhost:5000/api/feedback/submit" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "sessionId": "SESSION_ID",
    "toUserId": "USER_ID",
    "feedbackType": "tutor_to_learner",
    "rating": 5,
    "comment": "Great session!"
  }'
```

## Phase 7: Database Verification

```sql
-- Check if table exists
SELECT * FROM "Feedbacks" LIMIT 1;

-- Check record count
SELECT COUNT(*) as feedback_count FROM "Feedbacks";

-- View recent feedback
SELECT id, from_user_id, to_user_id, rating, "createdAt" 
FROM "Feedbacks" 
ORDER BY "createdAt" DESC 
LIMIT 5;

-- Check average rating for a user
SELECT 
  AVG(rating) as avg_rating, 
  COUNT(*) as total_feedback
FROM "Feedbacks" 
WHERE to_user_id = 'USER_ID';
```

## Phase 8: Browser DevTools Debugging

Open browser console (F12) and check for:
- [ ] No red errors related to feedback
- [ ] Feedback API calls successful (Network tab)
- [ ] Meeting data logged correctly
- [ ] No CORS errors

## Phase 9: Troubleshooting

### Problem: Feedback table not found
```bash
# Solution: Run migration manually
psql -d skillx -f backend/migrations/008_create_feedback_table.sql
```

### Problem: 404 on feedback endpoints
```bash
# Solution: Restart backend server
# Kill current process and npm start again
```

### Problem: Feedback form doesn't appear
```bash
# Check console for logged meeting data
# Ensure meeting includes tutor_id and learner_id
# See FEEDBACK_INTEGRATION_GUIDE.md for details
```

### Problem: VITE_API_URL not found
```bash
# Solution: Set in .env file for frontend
echo "VITE_API_URL=http://localhost:5000" >> frontend/.env
```

## Phase 10: Production Deployment

- [ ] Run all database migrations on production DB
- [ ] Rebuild frontend: `npm run build`
- [ ] Deploy `frontend/dist` to hosting
- [ ] Restart backend service
- [ ] Update API URLs for production environment
- [ ] Test one complete feedback flow in production
- [ ] Monitor error logs for first 24 hours

## Documentation Checklist

- [ ] Read `FEEDBACK_SYSTEM_GUIDE.md` - Full technical guide
- [ ] Read `FEEDBACK_QUICKREF.md` - Developers reference
- [ ] Read `FEEDBACK_INTEGRATION_GUIDE.md` - Integration details
- [ ] Read `FEEDBACK_DEPLOYMENT_CHECKLIST.md` - Deployment steps
- [ ] Read `FEEDBACK_IMPLEMENTATION_COMPLETE.md` - Overview

## Success Criteria

All items below should be true:
- ✅ Database migrations run successfully
- ✅ Backend starts without errors
- ✅ Frontend builds without errors
- ✅ Profile page shows rating section
- ✅ Feedback form appears after meeting
- ✅ Feedback can be submitted successfully
- ✅ Ratings display on user profiles
- ✅ All feedback visible on /feedback page
- ✅ No console errors in browser
- ✅ API endpoints respond correctly

## Quick Start Commands

```bash
# Terminal 1: Setup Database
psql -U postgres -d skillx -f backend/migrations/008_create_feedback_table.sql

# Terminal 2: Start Backend
cd backend && npm start

# Terminal 3: Start Frontend
cd frontend && npm run dev

# Terminal 4: Test API (optional)
curl http://localhost:5000/api/feedback/rating/user_id
```

## Contact for Issues

If anything doesn't work:
1. Check the documentation files (4 guides available)
2. Review browser console (F12)
3. Check backend logs (Terminal running npm start)
4. Review this checklist for missed steps
5. Verify all files were created/modified correctly

## Sign-Off

- [ ] All tests passed
- [ ] Documentation reviewed
- [ ] Ready for production deployment
- [ ] Team trained on feedback system

---

**Status**: Ready for Implementation  
**Last Updated**: April 2, 2026  
**Estimated Setup Time**: 15-30 minutes
