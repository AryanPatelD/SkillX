# Feedback System Implementation Guide

## Overview
A comprehensive feedback and rating system has been implemented for SkillX. After learners and tutors complete a meeting, they'll receive a feedback form where they can:
- Rate the other user (1-5 stars)
- Leave written comments
- View all feedback on user profiles with average ratings

## Features Implemented

### 1. **Database Schema**
- **Feedback Table**: Stores all feedback entries with:
  - `from_user_id`: User giving feedback
  - `to_user_id`: User receiving feedback
  - `session_id`: Reference to the meeting session
  - `feedback_type`: Either 'tutor_to_learner' or 'learner_to_tutor'
  - `rating`: 1-5 star rating (required)
  - `comment`: Optional text feedback
  - `categories`: JSON for categorical ratings
  - Unique constraint to prevent duplicate feedback per session

### 2. **Backend API Endpoints**

#### Submit Feedback
```
POST /api/feedback/submit
Headers: Authorization Bearer {token}
Body:
{
  "sessionId": "uuid",
  "toUserId": "uuid",
  "feedbackType": "tutor_to_learner" | "learner_to_tutor",
  "rating": 1-5,
  "comment": "optional text",
  "categories": {} (optional)
}
```

#### Get Feedback Received by User
```
GET /api/feedback/received/:userId?limit=50&offset=0
Response:
{
  "total": 10,
  "limit": 50,
  "offset": 0,
  "data": [...]
}
```

#### Get User's Average Rating
```
GET /api/feedback/rating/:userId
Response:
{
  "overallRating": 4.5,
  "totalFeedbacks": 15,
  "byFeedbackType": [
    {
      "type": "tutor_to_learner",
      "count": 8,
      "averageRating": "4.6"
    },
    ...
  ]
}
```

#### Get Feedback for a Specific Session
```
GET /api/feedback/session/:sessionId
```

#### Delete Feedback
```
DELETE /api/feedback/:feedbackId
Headers: Authorization Bearer {token}
(Only the user who gave the feedback can delete it)
```

### 3. **Frontend Components**

#### FeedbackForm Component
- Modal-based feedback submission form
- Star rating interface (1-5 stars)
- Comment suggestions based on feedback type
- Success/error handling
- Used after meetings end
- File: `frontend/src/components/FeedbackForm.jsx`

#### RatingDisplay Component
- Shows average rating with star visualization
- Displays total number of feedback
- Color-coded ratings (poor/fair/good/very good/excellent)
- File: `frontend/src/components/RatingDisplay.jsx`

#### UserFeedback Component
- Lists recent feedback for a user
- Shows feedback giver, rating, and comment
- Pagination support
- File: `frontend/src/components/UserFeedback.jsx`

#### UserFeedbackPage
- Full page view of all user feedback
- Integrates RatingDisplay and feedback list
- Pagination controls
- File: `frontend/src/pages/UserFeedbackPage.jsx`

### 4. **Meeting Flow Integration**

When a meeting ends:
1. User clicks "End Meeting" button
2. Meeting marked as completed in database
3. FeedbackForm appears automatically
4. User provides rating and optional comment
5. Feedback submitted to backend
6. User redirected to dashboard
7. Rating displayed on receiver's profile

### 5. **Profile Updates**

Profile page now displays:
- **Rating Section**: Shows average rating with star display
- **Recent Feedback**: Lists most recent 5 feedback items
- **View All Link**: Links to full feedback page for the user

### 6. **Route Structure**

New route:
```
/feedback/:userId - View all feedback for a user
```

## Database Migration

Run the migration to create the Feedback table:
```sql
-- File: backend/migrations/008_create_feedback_table.sql
```

## Installation & Setup

### Backend
1. Database migration already created
2. Model registered in `backend/src/models/index.js`
3. Routes registered in `backend/src/routes/feedback.routes.js`
4. App.js updated with feedback routes

### Frontend
1. Components created and ready to use
2. Routes added to App.jsx
3. Import statements added to necessary pages

## Usage Examples

### Submitting Feedback
```javascript
import FeedbackForm from '../components/FeedbackForm';

// In a component after meeting ends
<FeedbackForm
  sessionId={sessionId}
  toUserId={otherUserId}
  feedbackType="tutor_to_learner"
  onClose={() => navigate('/dashboard')}
  onSuccess={(data) => console.log('Feedback submitted')}
/>
```

### Displaying User Ratings
```javascript
import RatingDisplay from '../components/RatingDisplay';

<RatingDisplay
  averageRating={4.5}
  totalFeedbacks={15}
/>
```

### Getting User Feedback
```javascript
import axios from 'axios';

// Fetch ratings
const response = await axios.get('/api/feedback/rating/userId');
console.log(response.data.overallRating); // 4.5

// Fetch all feedback
const feedbacks = await axios.get('/api/feedback/received/userId');
console.log(feedbacks.data.data); // Array of feedback
```

## Important Notes

1. **Authorization**: Feedback submission requires authenticated user
2. **Unique Constraints**: Only one feedback per user pair per session to prevent duplicates
3. **Auto-update**: Ratings automatically calculated from all feedback
4. **Feedback Types**: Clear distinction between tutor→learner and learner→tutor feedback
5. **Pagination**: Feedback lists support pagination for better performance

## Data Models

### Feedback Model
```javascript
{
  id: UUID,
  session_id: UUID,
  from_user_id: UUID,
  to_user_id: UUID,
  feedback_type: 'tutor_to_learner' | 'learner_to_tutor',
  rating: 1-5,
  comment: String,
  categories: JSON,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## Testing the System

1. Complete a meeting between two users
2. At meeting end, feedback form appears
3. Submit feedback (required: rating, optional: comment)
4. Navigate to user's profile
5. See rating and feedback displayed
6. Click "View All Feedback" to see all reviews

## Future Enhancements

Potential improvements:
- Categorical ratings (communication, knowledge, professionalism, etc.)
- Response to feedback by recipients
- Feedback moderation/reporting
- Leaderboard based on ratings
- Reward system for high-rated users
- Email notifications for new feedback
- Anonymous feedback option

## API Testing with curl

```bash
# Submit feedback
curl -X POST http://localhost:5000/api/feedback/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "sessionId": "session-uuid",
    "toUserId": "user-uuid",
    "feedbackType": "tutor_to_learner",
    "rating": 5,
    "comment": "Great session!"
  }'

# Get user ratings
curl http://localhost:5000/api/feedback/rating/user-uuid

# Get received feedback
curl http://localhost:5000/api/feedback/received/user-uuid?limit=10&offset=0
```

## Support

For issues or questions about the feedback system, check the error logs and ensure:
- Database migration has been run
- Authentication middleware is properly configured
- CORS settings allow feedback API calls
- User IDs are valid UUIDs
