# Credits System Implementation Guide

## Overview
This document outlines the new credits feature implemented in the Skill Exchange application. The credits system allows users to earn and spend credits to book learning sessions with tutors.

## Features Implemented

### 1. Initial Credits Grant
- **When**: New user registration
- **Amount**: 10 credits
- **Purpose**: Allows new users to book their first learning session immediately

### 2. Credit-Based Session Booking
- **Cost**: 5 credits per session booking
- **Requirement**: User must have at least 5 credits to book a session
- **When**: Credits are deducted only when the tutor ACCEPTS the session (not on booking request)
- **Transfer**: When a tutor accepts a session request, 5 credits are:
  - Deducted from the learner's account
  - Added to the tutor's account

### 3. Enhanced Skill Request Form
- **New Fields**:
  - Title of request
  - Detailed description
  - Urgency level (Low, Normal, High)
  - Related skill dropdown
- **Improvements**: Better UI/UX with tips and explanations
- **Purpose**: Help tutors better understand what learners need

## Database Changes

### Schema Update
The `Users` table has been updated with:
```sql
credits INTEGER DEFAULT 0
```

### Migration
If you have an existing database, run the migration:
```sql
ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 0;
UPDATE "Users" SET credits = 10 WHERE credits = 0;
```

Or use the migration file:
```bash
psql -U your_user -d your_database -f backend/migrations/001_add_credits_to_users.sql
```

## Backend API Changes

### Updated Endpoints

#### User Registration
**Endpoint**: `POST /auth/register`
**Changes**: 
- User now receives 10 credits upon registration
- Response now includes `credits` field

**Example Response**:
```json
{
  "message": "User registered successfully",
  "token": "...",
  "user": {
    "id": "...",
    "username": "...",
    "email": "...",
    "full_name": "...",
    "credits": 10
  }
}
```

#### User Login
**Endpoint**: `POST /auth/login`
**Changes**: 
- Response now includes `credits` field

**Example Response**:
```json
{
  "message": "Login successful",
  "token": "...",
  "user": {
    "id": "...",
    "username": "...",
    "email": "...",
    "full_name": "...",
    "credits": 8
  }
}
```

#### Create Session Request
**Endpoint**: `POST /sessions/request`
**Changes**: 
- Now validates if user has at least 5 credits before creating session
- Returns error if insufficient credits

**Error Response**:
```json
{
  "message": "Insufficient credits. You need at least 5 credits to book a session."
}
```

#### Update Session Status
**Endpoint**: `PUT /sessions/:id/status`
**Changes**: 
- When status is updated to "Confirmed" and user is the provider:
  - 5 credits are deducted from requester
  - 5 credits are added to provider
  - Validates requester still has sufficient credits

## Frontend Changes

### Components

#### Navbar
- Added credits display showing current user's credits
- Credits shown in both desktop and mobile menus
- Uses coin icon from lucide-react

#### BookSession Page
- Added credit information box showing:
  - Current credits balance
  - Cost per session (5 credits)
- Added warning if user has insufficient credits (< 5)
- Session booking button disabled if user lacks credits
- Error messages now displayed for credit issues

#### Profile Page
- Added prominent credits card showing:
  - Available credits balance
  - Large visual representation
  - Explanation of credit usage

#### MySessions Page
- Added credit transfer information:
  - For tutors: Shows message that they'll receive 5 credits upon accepting
  - For learners: Shows warning that 5 credits will be deducted
  - Confirmation message when session is confirmed

#### RequestHelp Page
- Completely redesigned form:
  - Title field (new)
  - Detailed description field (improved)
  - Related skill dropdown (unchanged)
  - Urgency level selector (new)
  - Helpful tips box
  - More user-friendly UI

### Context Updates

#### AuthContext
- Now automatically stores credits from login/register responses
- Credits available in `user.credits` throughout the app

## User Flow Example

### Scenario: Alice learns Python from Bob

1. **Alice registers** → Receives 10 credits
2. **Alice books session with Bob** → Sessions is in "Pending" status, credits not yet deducted
3. **Bob accepts session** → "Confirmed" status, Alice's credits: 10 - 5 = 5, Bob's credits increase by 5
4. **Bob can now use his new credits** → To learn other skills or offer in future sessions

## Credit Management Best Practices

### For Users
- Save credits for sessions with highly-rated tutors
- Post skill requests to attract tutors who might offer free advice
- Complete sessions and get positive reviews to build reputation

### For Platform
- Monitor credit distribution for balance
- Consider implementing credit refunds for cancelled sessions
- Plan for credit-earning activities (completing sessions, getting reviews, etc.)

## Future Enhancements

Potential features to consider:
- Credit refunds for cancelled sessions (50% or full)
- Credit rewards for completing sessions successfully (feedback-based)
- Tiered pricing (different skills cost different credits)
- Premium features that cost credits
- Credit packages for purchase
- Bonus credits for streak milestones

## Testing Checklist

- [ ] New user registration grants 10 credits
- [ ] User login returns current credits
- [ ] Can't book session without 5+ credits
- [ ] Booking session shows warning when insufficient credits
- [ ] Credits properly deducted when tutor accepts session
- [ ] Credits properly added to tutor when accepting
- [ ] Credits persist across sessions/refreshes
- [ ] Credits display in navbar updated after session acceptance
- [ ] Skill request form accepts all fields
- [ ] All error messages display correctly

## Troubleshooting

### Credits not showing
- Ensure database migration was applied
- Clear browser localStorage and re-login
- Check that user object includes credits in API responses

### Credits not deducted/added
- Verify session status is updated to "Confirmed"
- Check that user IDs are correct
- Review database for credit values

### Session booking fails with credit error
- Verify user has at least 5 credits
- Ensure credits field exists in database
- Check API error response for details

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review API responses for error details
3. Verify database migrations were applied
4. Check browser console for client-side errors
