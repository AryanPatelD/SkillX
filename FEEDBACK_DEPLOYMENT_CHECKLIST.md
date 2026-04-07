# Feedback System - Setup & Deployment Checklist

## Pre-Deployment Checklist

### 1. Database Setup
- [ ] Run the migration SQL: `backend/migrations/008_create_feedback_table.sql`
  ```bash
  psql -U postgres -d skillx -f backend/migrations/008_create_feedback_table.sql
  ```

### 2. Backend Verification
- [ ] Feedback model imported in `backend/src/models/index.js`
- [ ] Feedback associations configured in models/index.js
- [ ] Feedback routes registered in `backend/src/app.js`
- [ ] Auth middleware imported in feedback.controller.js
- [ ] Test feedback endpoints with Postman/curl

### 3. Frontend Verification
- [ ] All feedback components exist and have no syntax errors
- [ ] FeedbackForm imported in MeetingRoom.jsx
- [ ] RatingDisplay and UserFeedback imported in Profile.jsx
- [ ] UserFeedbackPage route added to App.jsx
- [ ] VITE_API_URL environment variable configured

### 4. Backend Testing
```bash
# Start backend (if not already running)
cd backend
npm install  # if needed
npm start

# Test feedback submission
curl -X POST http://localhost:5000/api/feedback/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "toUserId": "user-uuid",
    "feedbackType": "tutor_to_learner",
    "rating": 5,
    "comment": "Great session!"
  }'
```

### 5. Frontend Testing
```bash
# Start frontend
cd frontend
npm run dev

# Test URLs:
# - http://localhost:5173/profile - See rating display
# - http://localhost:5173/feedback/user-id - See all feedback
# - Complete a meeting and submit feedback
```

## Deployment Steps

### Step 1: Database Migration
```bash
# Production database setup
psql -U postgres -d skillx_production -f backend/migrations/008_create_feedback_table.sql
```

### Step 2: Backend Restart
```bash
# Restart backend service to load new routes
systemctl restart skillx-backend

# Or if using PM2:
pm2 restart skillx-backend
```

### Step 3: Frontend Build & Deploy
```bash
# Build frontend
cd frontend
npm run build

# Deploy dist folder to hosting/server
# Update API URL if needed for production
```

## Post-Deployment Verification

- [ ] Access user profile - ratings display visible
- [ ] View feedback page - loads without errors
- [ ] Complete a test meeting - feedback form appears on end
- [ ] Submit feedback - check email logs for notifications (if implemented)
- [ ] Verify database entries - check Feedbacks table

## Troubleshooting

### Issue: Feedback table not found
```bash
# Check if migration ran:
psql -d skillx -c "\dt Feedbacks"

# If not found, run migration manually:
psql -d skillx -f backend/migrations/008_create_feedback_table.sql
```

### Issue: Feedback API returns 404
- Verify routes registered in `app.js`
- Check server logs: `npm start`
- Ensure backend restarted after code changes

### Issue: Feedback form doesn't appear after meeting
- Check browser console for errors
- Verify FeedbackForm component imported correctly
- Ensure meeting cleanup logic triggers form display

### Issue: Cannot submit feedback - 401 error
- Check Authorization header includes Bearer token
- Verify token hasn't expired
- Confirm auth middleware is properly configured

## Performance Monitoring

Monitor these metrics post-deployment:
- Feedback query performance (should be <100ms)
- Average rating calculation time
- Feedback API response times
- Database table size growth

## Security Checklist

- [ ] CORS has feedback endpoints whitelisted
- [ ] Authentication required for all write operations
- [ ] Users can only delete their own feedback
- [ ] Input validation on ratings (1-5 only)
- [ ] Rate limiting on feedback endpoints (optional)
- [ ] Feedback data encrypted in transit (HTTPS)

## Rollback Plan

If issues arise:
1. Keep previous database schema backup
2. Can disable feedback routes by commenting in app.js
3. Remove feedback components from UI
4. Revert to previous git commit if needed

## Documentation Files

Created documentation:
- `FEEDBACK_SYSTEM_GUIDE.md` - Complete implementation guide
- `FEEDBACK_QUICKREF.md` - Quick reference for developers
- `/memories/repo/feedback_system.md` - Implementation summary

## Next Steps

1. Run database migration
2. Restart backend server
3. Test with the checklist above
4. Deploy to staging environment
5. Get user testing/feedback
6. Deploy to production

## Support & Maintenance

- Monitor error logs in `/logs` directory
- Check database for orphaned feedback records
- Update API documentation with new endpoints
- Plan for feedback moderation features (v2)

## Version Information

- Feedback System: v1.0
- Implemented: April 2026
- Database: PostgreSQL
- Frontend Framework: React + Vite
- Backend Framework: Express.js + Sequelize
