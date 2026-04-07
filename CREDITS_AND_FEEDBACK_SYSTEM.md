# Credits and Feedback System

## Overview
The SkillX platform now includes an integrated **Credits System** that tracks user performance through feedback ratings. Users earn or lose credits based on feedback received from their learning partners.

## Credit Scoring System

Credits are automatically awarded or deducted based on the rating received in feedback:

| Rating | Label | Credits | Meaning |
|--------|-------|---------|---------|
| ⭐⭐⭐⭐⭐ | Excellent | +10 | Outstanding performance |
| ⭐⭐⭐⭐ | Very Good | +5 | Good performance |
| ⭐⭐⭐ | Average | 0 | Acceptable performance |
| ⭐⭐ | Below Average | -3 | Below expected performance |
| ⭐ | Poor | -5 | Needs improvement |

## How Credits Work

### When Feedback is Submitted
1. User ends a meeting or session
2. Feedback form appears asking for a rating (1-5 stars)
3. User submits feedback with optional comments
4. **Credits are instantly calculated and applied** to the recipient's account
5. Success message shows:
   - ✅ Confirmation of feedback submission
   - 📊 Credit points earned/deducted
   - 📈 Recipient's total credits
   - 🎯 Rating label (Poor/Fair/Good/Very Good/Excellent)

### Credit Display
- **Profile Page**: Shows total credits earned
- **Feedback Success Message**: Shows immediate credit change
- **User Stats**: Can view complete credit history through feedback page

## Feedback Types

### Two-Way Feedback System

**1. Tutor to Learner Feedback**
- Tutors provide feedback on learner's performance
- Considers: Grasp of concepts, engagement, questions asked, behavior
- Credits awarded/deducted to learner

**2. Learner to Tutor Feedback**
- Learners provide feedback on tutor's teaching
- Considers: Explanation clarity, patience, adaptability, teaching effectiveness
- Credits awarded/deducted to tutor

## Meet -> Feedback -> Credits Flow

```
User ends meeting
         ↓
   Feedback form appears
         ↓
   User rates (1-5 stars)
         ↓
   User submits feedback
         ↓
   Backend processes:
   • Validates rating
   • Calculates credits using formula
   • Updates recipient's credits
   • Creates feedback record
         ↓
   Success message shows:
   • Confirmation
   • Credits changed
   • New total credits
         ↓
   Auto-redirects after 2 seconds
```

## API Endpoints

### Submit Feedback
```
POST /api/feedback/submit
Headers: Authorization: Bearer <token>
Body: {
    sessionId: "uuid",           // Meeting session ID
    toUserId: "uuid",            // Recipient user ID
    feedbackType: "tutor_to_learner" or "learner_to_tutor",
    rating: 1-5,                 // Required
    comment: "text"              // Optional
}

Response: {
    message: "Feedback submitted successfully",
    data: { /* feedback record */ },
    credits: {
        changed: 5,              // +5 or -3 or 0
        ratingLabel: "Very Good",
        recipientCredits: 125,   // New total
        recipientName: "John Doe"
    }
}
```

### Get User's Profile with Credits
```
GET /api/profile/public/:userId
Response includes credits and credit statistics
```

### View Feedback Received
```
GET /api/feedback/received/:userId?limit=50&offset=0
Shows all feedback received with credits applied
```

## Features

✅ **Real-time Credit Updates**: Credits applied immediately upon feedback submission
✅ **Transaction Safety**: Uses database transactions to ensure data consistency
✅ **Duplicate Prevention**: Only one feedback per session per user pair
✅ **Feedback Tracking**: Complete history of who gave/received feedback
✅ **Visual Feedback**: Success message shows immediate credit impact
✅ **Rating Labels**: User-friendly rating descriptions (Poor, Fair, Good, etc.)
✅ **Scrollable Modal**: Feedback form works on mobile and desktop
✅ **Error Handling**: Validates ratings, sessions, and users

## Frontend Implementation

### FeedbackForm Component
- **Location**: `frontend/src/components/FeedbackForm.jsx`
- **Features**:
  - Interactive 5-star rating selector
  - Hover effects on stars
  - Guided feedback prompts
  - Character count for comment (500 max)
  - Scrollable modal for mobile compatibility
  - Success message with credits display
  - Error handling and validation

### Success Message Display
After submission, users see:
```
✅ Thank you for your feedback!
📊 [Recipient] received feedback
+5 points
Rating: Very Good
Total Credits: 125
(Auto-redirects in 2 seconds...)
```

## Database Schema

### Feedback Table
```sql
CREATE TABLE "Feedbacks" (
    id UUID PRIMARY KEY,
    from_user_id UUID NOT NULL (who gave the feedback),
    to_user_id UUID NOT NULL (who received it),
    session_id UUID (meeting session reference),
    feedback_type VARCHAR (tutor_to_learner or learner_to_tutor),
    rating INTEGER (1-5) NOT NULL,
    comment TEXT,
    categories JSONB,
    createdAt TIMESTAMP,
    updatedAt TIMESTAMP,
    UNIQUE(from_user_id, to_user_id, session_id)
);
```

### Users Table (Updated)
```sql
ALTER TABLE "Users" ADD COLUMN credits INTEGER DEFAULT 0;
-- Users start with 0 credits or 10 initial credits
```

## Example Scenarios

### Scenario 1: Excellent Session
- Tutor ends meeting with learner
- Tutor rates learner as "Excellent" (5 stars)
- Learner's credits: **+10** ✨
- Learner sees: "+10 points - Excellent"

### Scenario 2: Poor Performance
- Learner rates tutor as "Poor" (1 star)
- Tutor's credits: **-5** ⚠️
- Tutor sees: "-5 points - Poor"

### Scenario 3: Update Existing Feedback
- User resubmits feedback for same session
- New rating: 4 stars (+5), Previous: 2 stars (-3)
- Credit difference: +8 (net change for recipient)
- Recipient's total updated accordingly

## Best Practices

1. **Be Honest**: Provide genuine ratings to help others improve
2. **Add Comments**: Detailed feedback with comments is more helpful
3. **Consistent Ratings**: Similar performance over time shows reliability
4. **Positive Community**: Good ratings encourage continued learning

## Future Enhancements

- 🎖️ Achievement badges based on credits
- 📈 Credit leaderboard
- 🎁 Credit rewards system
- 📊 Credit history visualization
- 🔔 Credit milestone notifications
- 💰 Exchange credits for benefits

## Troubleshooting

### Credits Not Updating
- Check if feedback was actually submitted (look for success message)
- Verify both users exist in the database
- Check backend logs for any errors

### Feedback Form Not Scrolling
- The modal automatically scrolls on mobile devices
- Max height is 90vh with overflow-y auto
- Works on all screen sizes

### Session Not Found Error
- Ensure the meeting session ID is correct
- Check if session exists in database before submitting
- Optional: Can submit feedback without session ID

## Support
For issues with the credits system, please contact the support team or check the backend logs.
