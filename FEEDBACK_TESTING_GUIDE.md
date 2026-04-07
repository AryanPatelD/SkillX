# Feedback System - Quick Test Guide 🚀

## Pre-Requirements
- ✅ Backend running (`npm run dev`)
- ✅ Frontend running (`npm run dev`)
- ✅ PostgreSQL database configured
- ✅ Both users logged in or able to test

## Complete User Flow Test

### Step 1: Start a Meeting
1. Log in as User A (Tutor)
2. Initiate a meeting with User B (Learner)
3. Wait for User B to join or simulate join
4. Conduct a fake/short meeting
5. **Stop/End the meeting** (click "End Meeting" button)

### Step 2: Feedback Form Appears
**Expected:**
- Modal popup appears with:
  - ⭐ star icon and "Learner Feedback" title
  - "How would you rate this session?" question
  - 5 empty gray stars
  - "Share Your Feedback" section with prompts
  - Textarea for comments
  - Cancel and Submit buttons at bottom

### Step 3: Submit Feedback
1. **Select Rating**: Click on 4th star ⭐⭐⭐⭐
   - Stars should turn yellow
   - "4/5 - Very Good" label appears
   
2. **Add Comment (Optional)**:
   - Type: "Great explanation, very clear!"
   - Character count updates: "18/500 characters"
   
3. **Submit**:
   - Click "✓ Submit Feedback" button
   - Button shows "⏳ Submitting..." while processing
   - Form is disabled during submission

### Step 4: Success Message Appears
**Expected:**
```
✅
Thank you for your feedback!

[Recipient Name] received feedback

+5 points

Rating: Very Good
Total Credits: [new total]

Redirecting...
```

- Wait 2 seconds
- Automatically redirect to dashboard

### Step 5: Verify Credits Updated
1. Navigate to recipient's profile page
2. Check credits: should increased by 5
3. View feedback sections: new feedback should appear

## Test All Credit Scenarios

### Scenario A: Excellent (5★) = +10 Points
1. End meeting
2. Click all 5 stars
3. Submit
4. **Verify**: "+10 points - Excellent" in success message
5. Recipient's credits +10

### Scenario B: Very Good (4★) = +5 Points
1. End meeting
2. Click 4 stars
3. Submit
4. **Verify**: "+5 points - Very Good"
5. Recipient's credits +5

### Scenario C: Average (3★) = 0 Points
1. End meeting
2. Click 3 stars
3. Submit
4. **Verify**: "0 points - Average" (or no points message)
5. Recipient's credits unchanged

### Scenario D: Below Average (2★) = -3 Points
1. End meeting
2. Click 2 stars
3. Submit
4. **Verify**: "-3 points - Below Average"
5. Recipient's credits -3

### Scenario E: Poor (1★) = -5 Points
1. End meeting
2. Click 1 star
3. Submit
4. **Verify**: "-5 points - Poor"
5. Recipient's credits -5

## Test Error Cases

### Error Case 1: No Rating Selected
1. Open feedback form
2. Leave stars empty (don't click any)
3. Click "✓ Submit Feedback"
4. **Expected**: Error message "Please provide a rating"
5. Form stays open

### Error Case 2: End Meeting & Close Form
1. Open feedback form
2. Click "Cancel"
3. **Expected**: Form closes, redirects to dashboard

### Error Case 3: Long Comment
1. Type 500+ characters in comment
2. Should not allow more than 500
3. Character count shows "500/500"

## Test Mobile Responsiveness

### Mobile Test (< 600px width)
1. Open browser DevTools (F12)
2. Toggle device toolbar (375px width)
3. End meeting to trigger feedback form
4. **Expected:**
   - Modal fits on screen
   - Can scroll to see all elements
   - All buttons clickable
   - Stars display properly

## Database Verification

### Check Backend Logs
```
SSEMS Backend is running on port 5000
```

### Check Feedback Table
```sql
SELECT * FROM "Feedbacks" 
ORDER BY "createdAt" DESC 
LIMIT 1;

-- Should show:
-- from_user_id: [User A's ID]
-- to_user_id: [User B's ID]
-- rating: 4
-- feedback_type: tutor_to_learner
-- comment: [your comment]
```

### Check User Credits Updated
```sql
SELECT id, full_name, credits 
FROM "Users" 
WHERE id = '[User B ID]';

-- Should show increased credits
```

## Frontend Network Check

### Open Browser DevTools (F12)
1. Go to Network tab
2. End meeting and submit feedback
3. **Expected POST request:**
   ```
   URL: /api/feedback/submit
   Status: 201 Created
   Response: {
     "message": "Feedback submitted successfully",
     "credits": { changed: 5, ... }
   }
   ```

## Troubleshooting Checklist

- [ ] Backend is running (check port 5000)
- [ ] Frontend is running (check port 5173 or 5174)
- [ ] Database migrations completed
- [ ] Users exist in database
- [ ] Both users have valid JWT tokens
- [ ] Meeting has been started and has an ID
- [ ] Both users marked as ended meeting

## If Something Goes Wrong

### 1. Buttons Not Visible
- Scroll down in the modal
- Modal has `maxHeight: 90vh` and scrolls
- Try expanding browser window

### 2. Feedback Not Submitting
- Check browser console (F12 → Console tab)
- Check network tab for error responses
- Verify rating is selected (1-5)
- Check backend logs

### 3. Credits Not Updated
- Refresh profile page
- Check database: `SELECT credits FROM "Users" WHERE id = '[id]'`
- Check feedback table: verify record exists
- Restart backend if needed

### 4. Form Disappears Immediately
- Check if auto-redirect is happening
- Verify `onClose` handler not being called prematurely
- Check browser console for errors

## Quick Commands

### Start Everything
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev

# Then open: http://localhost:5173
```

### Check Logs
```bash
# View backend logs
npm run dev

# View database
psql -U postgres -d skillx -c "SELECT * FROM \"Feedbacks\" LIMIT 5;"

# Check user credits
psql -U postgres -d skillx -c "SELECT full_name, credits FROM \"Users\" LIMIT 10;"
```

## Expected Performance
- Form renders: < 500ms
- Submit feedback: < 1s
- Success message displays: instant
- Credits update: instant
- Redirect: 2 seconds

## Success Criteria ✅

- [x] Feedback form displays when meeting ends
- [x] 5-star rating selector works with hover effects
- [x] Character counter tracks comments (500 max)
- [x] Submit button works and shows loading state
- [x] Success message displays with credit info
- [x] Credits calculated correctly based on rating
- [x] Recipient's profile updated with new credits
- [x] Form redirects after 2 seconds
- [x] Works on mobile (scrollable modal)
- [x] Error handling for validation failures

## Next Test: Multi-Session Feedback

1. End first meeting, submit feedback (Rating: 5 = +10)
2. Score increases by 10
3. End second meeting with same user, submit feedback (Rating: 3 = 0)
4. Score stays same (already has +10)
5. End third meeting, update first feedback to 2 = -3
6. Score should calculate difference: -3 - 10 = -13 net change

Good luck! 🎉
