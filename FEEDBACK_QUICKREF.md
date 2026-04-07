# Feedback System - Quick Reference

## Files Modified/Created

### Backend
1. **Models**
   - ✅ `backend/src/models/feedback.model.js` - Feedback database model
   - ✅ `backend/src/models/index.js` - Added Feedback model import and associations

2. **Controllers**
   - ✅ `backend/src/controllers/feedback.controller.js` - All feedback business logic
   - ✅ `backend/src/controllers/profile.controller.js` - Added getPublicProfile method

3. **Routes**
   - ✅ `backend/src/routes/feedback.routes.js` - Feedback API endpoints
   - ✅ `backend/src/routes/profile.routes.js` - Added public profile route
   - ✅ `backend/src/app.js` - Registered feedback routes

4. **Migrations**
   - ✅ `backend/migrations/008_create_feedback_table.sql` - Create feedback table

### Frontend
1. **Components**
   - ✅ `frontend/src/components/FeedbackForm.jsx` - Form for submitting feedback
   - ✅ `frontend/src/components/RatingDisplay.jsx` - Shows average rating
   - ✅ `frontend/src/components/UserFeedback.jsx` - Lists recent feedback

2. **Pages**
   - ✅ `frontend/src/pages/Profile.jsx` - Updated with rating display and feedback
   - ✅ `frontend/src/pages/MeetingRoom.jsx` - Shows feedback form when meeting ends
   - ✅ `frontend/src/pages/UserFeedbackPage.jsx` - Full feedback view page
   - ✅ `frontend/src/App.jsx` - Added feedback route

## Key Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/feedback/submit` | Submit feedback |
| GET | `/api/feedback/received/:userId` | Get feedback for a user |
| GET | `/api/feedback/given/:userId` | Get feedback given by a user |
| GET | `/api/feedback/rating/:userId` | Get user's average rating |
| GET | `/api/feedback/session/:sessionId` | Get feedback for session |
| DELETE | `/api/feedback/:feedbackId` | Delete feedback |
| GET | `/profile/public/:userId` | Get profile with ratings |

## Flow Diagram

```
Meeting Ends
    ↓
Check Window Closed / End Meeting Button
    ↓
Mark Session as Completed
    ↓
Show FeedbackForm
    ↓
User Submits Rating + Comment
    ↓
Store in Database
    ↓
Redirect to Dashboard
    ↓
Rating Visible on User Profile
```

## Component Usage

### 1. FeedbackForm
```jsx
<FeedbackForm
  sessionId={meetingId}
  toUserId={otherPersonId}
  feedbackType="tutor_to_learner" // or "learner_to_tutor"
  onClose={() => handleClose()}
  onSuccess={(data) => console.log(data)}
/>
```

### 2. RatingDisplay
```jsx
<RatingDisplay
  averageRating={4.5}
  totalFeedbacks={20}
/>
```

### 3. UserFeedback
```jsx
<UserFeedback
  userId={userId}
  showAll={false} // Show 5 most recent (true = show all)
/>
```

## Database Structure

```
Feedbacks Table
├── id (UUID, PK)
├── from_user_id (UUID, FK → Users)
├── to_user_id (UUID, FK → Users)
├── session_id (UUID, FK → MeetingSessions)
├── feedback_type (ENUM: tutor_to_learner, learner_to_tutor)
├── rating (INTEGER: 1-5)
├── comment (TEXT)
├── categories (JSONB)
├── createdAt (TIMESTAMP)
└── updatedAt (TIMESTAMP)

Indexes:
- from_user_id
- to_user_id
- session_id
- feedback_type
- UNIQUE(from_user_id, to_user_id, session_id)
```

## Environment Setup

### Required .env variables
```
VITE_API_URL=http://localhost:5000
```

### Database Setup
1. Run migration: `008_create_feedback_table.sql`
2. Ensure Sequelize models are synced

## Testing Checklist

- [ ] User can submit feedback after meeting ends
- [ ] Rating appears on user profile
- [ ] Average rating is calculated correctly
- [ ] All feedback visible on feedback page
- [ ] Pagination works on feedback page
- [ ] Cannot submit duplicate feedback for same session
- [ ] Feedback form shows different prompts for tutor vs learner
- [ ] Star rating UI responds to hover/click
- [ ] Success message shows after submission
- [ ] Unauthorized users cannot delete others' feedback

## Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| Feedback not saving | Check token in localStorage, verify session_id |
| Rating not showing | Run migration, sync Sequelize models |
| CORS error | Check CORS settings in app.js |
| 404 on feedback endpoint | Verify routes registered in app.js |
| Form not appearing | Check meeting closed detection logic |

## Performance Considerations

- Feedback queries use pagination (default 50 items)
- Average rating calculated with GROUP BY for efficiency
- Indexes on frequently queried fields (user_ids, session_id)
- Unique constraint prevents duplicate entries

## Security Measures

✅ Authentication required for submission
✅ Users can only delete their own feedback
✅ Input validation on rating (1-5 only)
✅ SQL injection prevention (Sequelize parameterized)
✅ No sensitive user data in feedback table
