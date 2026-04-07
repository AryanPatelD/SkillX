# Feedback System - Integration Guide

## How to Ensure Feedback Works with Your Meeting Flow

### Prerequisites
The feedback system requires that when a meeting is passed to the MeetingRoom component, it includes:
- `id` - Meeting session ID
- `tutor_id` - ID of the tutor
- `learner_id` - ID of the learner
- `meeting_link` - The video meeting link
- `status` - Current session status

### Example Meeting Object
```javascript
{
  id: "550e8400-e29b-41d4-a716-446655440000",
  tutor_id: "tutor-user-id",
  learner_id: "learner-user-id",
  meeting_link: "https://...",
  status: "scheduled",
  learner_name: "John Doe",
  confirmed_slot: { date: "2026-04-02", startTime: "10:00", endTime: "11:00" },
  ...
}
```

### Integration Points

#### 1. From MySessions Page
When navigating to a meeting from MySessions:
```javascript
// ✅ Correct - include meeting data
navigate(`/meeting/${sessionId}`, { 
    state: { 
        meeting: {
            ...sessionData,
            tutor_id: sessionData.tutor_id,      // ← Include this
            learner_id: sessionData.learner_id    // ← Include this
        } 
    } 
});

// ❌ Incorrect - missing tutor/learner IDs
navigate(`/meeting/${sessionId}`);
```

#### 2. From Meeting Selection
When selecting a meeting to join:
```javascript
const handleJoinMeeting = async (session) => {
    // Ensure tutor_id and learner_id are present
    const meetingData = {
        ...session,
        // These must be populated:
        tutor_id: session.tutor_id || session.providerId,
        learner_id: session.learner_id || session.requesterId
    };
    
    navigate('/meeting', {
        state: { meeting: meetingData }
    });
};
```

#### 3. From Meeting List
When getting meetings to display:
```javascript
// Fetch with associations to get user IDs
const response = await api.get('/api/meeting/sessions');
// The response should include tutor_id and learner_id
// If not, update the backend endpoint to include them
```

### Backend Endpoint Check

If tutor_id and learner_id are not being returned by meeting endpoints, update the backend to include them:

```javascript
// In backend meeting controller
exports.getSession = async (req, res) => {
    const session = await MeetingSession.findByPk(req.params.id, {
        include: [
            { model: User, as: 'tutor', attributes: ['id', 'full_name'] },
            { model: User, as: 'learner', attributes: ['id', 'full_name'] }
        ]
    });
    
    // Include user IDs in response
    res.json({
        ...session.toJSON(),
        tutor_id: session.tutor_id,      // ← Include these
        learner_id: session.learner_id
    });
};
```

### Frontend Component Props

When passing meeting data to MeetingRoom:

```jsx
<MeetingRoom />
// Data passed via location.state needs:
// - id (session ID)
// - tutor_id (tutor user ID)  ← REQUIRED for feedback
// - learner_id (learner user ID) ← REQUIRED for feedback
// - meeting_link (video URL)
// - learner_name (optional, for display)
```

### Debugging

If feedback form doesn't appear:

1. **Check meeting data in browser console:**
```javascript
// In MeetingRoom.jsx, add to useEffect
useEffect(() => {
    if (location.state?.meeting) {
        console.log('Meeting data:', location.state.meeting);
        console.log('tutor_id:', location.state.meeting.tutor_id);
        console.log('learner_id:', location.state.meeting.learner_id);
    }
}, []);
```

2. **Verify data is being passed:**
```javascript
// When navigating to meeting
console.log('Navigating with meeting:', meeting);
navigate('/meeting', { state: { meeting } });
```

3. **Check backend API:**
```bash
# Test if meeting endpoint returns user IDs
curl "http://localhost:5000/api/meeting/sessions/:id" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  | jq '.tutor_id, .learner_id'
```

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Feedback form doesn't appear | Check console for `otherUserId` - ensure tutor_id/learner_id in meeting data |
| "Tutor/Learner IDs not available" warning | Update meeting endpoint to include these fields |
| Feedback submits but says invalid `toUserId` | Verify user ID format matches what's in database |

### Testing Checklist

- [ ] Meeting object has `tutor_id` and `learner_id`
- [ ] Meeting object is passed via `location.state`
- [ ] Browser console shows correct user IDs
- [ ] Meeting ends and feedback form appears
- [ ] Rating can be submitted successfully
- [ ] Rating appears on user profile

### Optional: Fallback Logic

If you want to make the system more robust without always having user IDs:

```javascript
// In MeetingRoom.jsx handleMeetingEnd
const determineUserRole = async () => {
    try {
        // Try to get full meeting details if not available
        const response = await api.get(`/api/meeting/sessions/${meeting.id}`);
        const fullMeeting = response.data;
        
        if (fullMeeting.tutor_id && fullMeeting.learner_id) {
            setMeeting(fullMeeting); // Update with full data
            return fullMeeting;
        }
    } catch (err) {
        console.error('Could not fetch meeting details:', err);
    }
    return meeting;
};

// Use this in handleMeetingEnd if IDs not available initially
```

---

## Summary

**For feedback to work:**
1. Pass meeting object with `tutor_id` and `learner_id` to MeetingRoom
2. Ensure these fields are populated from backend API
3. Test that feedback form appears when meeting ends
4. Verify ratings save to database

**Best Practice:**
- Always include user ID fields when fetching/passing session data
- Backend should return these fields in all session endpoints
- Frontend should validate IDs exist before showing feedback form
