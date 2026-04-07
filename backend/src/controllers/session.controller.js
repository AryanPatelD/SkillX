const db = require('../models');
const Session = db.Session;
const User = db.User;
const Skill = db.Skill;
const SkillRequest = db.SkillRequest;
const { createDailyMeeting } = require('../services/dailyMeeting.service');

// Create a new session from "Offer to Help" modal (Teacher offering availability)
exports.offerHelp = async (req, res) => {
    try {
        const { requestId, provider_available_from, provider_available_to } = req.body;
        const providerId = req.user.id;

        console.log('📝 offerHelp called:', { requestId, providerId, provider_available_from, provider_available_to });

        // Validate skill request exists
        const skillRequest = await SkillRequest.findByPk(requestId);
        if (!skillRequest) {
            return res.status(404).json({ message: 'Skill request not found' });
        }

        console.log('📝 SkillRequest found:', skillRequest);

        // Get requester to check credits
        const requester = await User.findByPk(skillRequest.requesterId);
        if (!requester) {
            return res.status(404).json({ message: 'Requester not found' });
        }

        if (requester.credits < 5) {
            return res.status(400).json({ message: 'Requester does not have sufficient credits. Need at least 5 credits.' });
        }

        // Create session with provider availability
        const session = await Session.create({
            requesterId: skillRequest.requesterId,
            providerId,
            skillId: skillRequest.skillId,
            skillRequestId: requestId,
            status: 'Pending',
            provider_available_from,
            provider_available_to
        });

        console.log('✅ Session created:', session);

        // Update skill request status to 'In_Progress' so it disappears from Open Requests
        skillRequest.status = 'In_Progress';
        await skillRequest.save();
        console.log('✅ SkillRequest status updated to In_Progress');

        // Fetch full session data with relationships
        const fullSession = await Session.findByPk(session.id, {
            include: [
                { model: User, as: 'requester', attributes: ['id', 'full_name', 'roll_no'] },
                { model: User, as: 'provider', attributes: ['id', 'full_name', 'roll_no'] },
                { model: Skill, as: 'skill', attributes: ['id', 'name', 'category'] }
            ]
        });

        // Emit real-time event
        const io = req.app.locals.io;
        if (io) {
            io.emit('sessionCreated', {
                sessionId: session.id,
                providerId,
                requesterId: skillRequest.requesterId,
                skillId: skillRequest.skillId,
                skillRequestId: requestId,
                provider_available_from,
                provider_available_to,
                status: 'Pending',
                timestamp: new Date()
            });
        }

        res.status(201).json({ message: 'Help offer sent successfully', session: fullSession });
    } catch (error) {
        console.error('❌ Error in offerHelp:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get sessions where the user is the provider (Incoming requests)
exports.getIncomingRequests = async (req, res) => {
    try {
        const userId = req.user.id;
        const sessions = await Session.findAll({
            where: { 
                providerId: userId,
                status: { [db.Sequelize.Op.ne]: 'Cancelled' } // Exclude cancelled sessions
            },
            include: [
                { model: User, as: 'requester', attributes: ['id', 'full_name', 'roll_no'] },
                { model: User, as: 'provider', attributes: ['id', 'full_name', 'roll_no'] },
                { model: Skill, as: 'skill', attributes: ['id', 'name', 'category'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(sessions);
    } catch (error) {
        console.error('Error in getIncomingRequests:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update session status (Accept, Reject, Complete, Cancel)
exports.updateSessionStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user.id;

        const session = await Session.findByPk(id);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Ensure user is part of the session
        if (session.providerId !== userId && session.requesterId !== userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Handle credit transfer when provider accepts (Confirmed)
        if (status === 'Confirmed' && session.providerId === userId && session.status === 'Pending') {
            // Get requester and provider
            const requester = await User.findByPk(session.requesterId);
            const provider = await User.findByPk(session.providerId);

            // Check if requester still has enough credits
            if (requester.credits < 5) {
                return res.status(400).json({ message: 'Requester does not have enough credits for this session.' });
            }

            // Deduct 5 credits from requester, add 5 to provider
            requester.credits -= 5;
            provider.credits += 5;

            await requester.save();
            await provider.save();
        }

        // If requester declines, change skill request back to 'Open'
        if (status === 'Cancelled' && session.requesterId === userId && session.status === 'Pending') {
            const skillRequest = await SkillRequest.findByPk(session.skillRequestId);
            if (skillRequest) {
                skillRequest.status = 'Open';
                await skillRequest.save();
                console.log('✅ SkillRequest status reverted to Open due to learner decline');
            }
        }

        session.status = status;
        
        // Track when session is cancelled for later auto-deletion
        if (status === 'Cancelled' && !session.cancelledAt) {
            session.cancelledAt = new Date();
        }
        
        await session.save();

        // Create MeetingSession when session is confirmed
        if (status === 'Confirmed' && session.status === 'Confirmed') {
            try {
                const MeetingSession = db.MeetingSession;
                const requester = await User.findByPk(session.requesterId);
                const provider = await User.findByPk(session.providerId);
                
                console.log('🎥 [updateSessionStatus] Creating Daily.co meeting for session:', session.id);
                
                // Generate Daily.co meeting
                const dailyMeeting = createDailyMeeting(session.id, requester.full_name);
                console.log('📍 [updateSessionStatus] Daily.co meeting result:', dailyMeeting);
                
                if (!dailyMeeting.success) {
                    throw new Error('Failed to create Daily.co meeting: ' + dailyMeeting.error);
                }
                
                // Create meeting session with Daily.co provider
                const meetingSession = await MeetingSession.create({
                    learner_name: requester.full_name,
                    tutor_id: provider.id,
                    learner_id: requester.id,
                    status: 'scheduled',
                    meeting_link: dailyMeeting.meetingUrl,
                    video_provider: 'daily',
                    provider_room_id: dailyMeeting.roomName,
                    proposed_slots: [{
                        date: new Date(session.scheduled_time).toISOString().split('T')[0],
                        startTime: new Date(session.scheduled_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
                        endTime: new Date(new Date(session.scheduled_time).getTime() + 60 * 60 * 1000).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
                    }],
                    confirmed_slot: {
                        date: new Date(session.scheduled_time).toISOString().split('T')[0],
                        startTime: new Date(session.scheduled_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
                        endTime: new Date(new Date(session.scheduled_time).getTime() + 60 * 60 * 1000).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
                    }
                });
                
                // Update main session with meeting link
                session.meeting_link = dailyMeeting.meetingUrl;
                await session.save();
                
                console.log('✅✅ [updateSessionStatus] Meeting created successfully:', meetingSession.id);
            } catch (error) {
                console.error('❌ [updateSessionStatus] Error creating MeetingSession:', error);
                console.error('Error details:', error.message);
                // Continue anyway - don't fail the entire operation
            }
        }

        // Emit real-time event
        const io = req.app.locals.io;
        if (io) {
            io.emit('sessionStatusUpdated', {
                sessionId: session.id,
                requesterId: session.requesterId,
                providerId: session.providerId,
                status,
                timestamp: new Date()
            });
        }

        res.json({ message: `Session ${status} successfully`, session });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Learner confirms the session with a scheduled time
exports.confirmSessionTime = async (req, res) => {
    try {
        const { id } = req.params;
        const { scheduled_time } = req.body;
        const userId = req.user.id;

        const session = await Session.findByPk(id);
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        // Only requester can confirm
        if (session.requesterId !== userId) {
            return res.status(403).json({ message: 'Only the requester can confirm the session time' });
        }

        // Check session is still pending
        if (session.status !== 'Pending') {
            return res.status(400).json({ message: 'Can only confirm pending sessions' });
        }

        // Validate scheduled_time is within provider's availability
        const scheduledDate = new Date(scheduled_time);
        const fromDate = new Date(session.provider_available_from);
        const toDate = new Date(session.provider_available_to);

        if (scheduledDate < fromDate || scheduledDate > toDate) {
            return res.status(400).json({ message: 'Scheduled time must be within provider\'s availability window' });
        }

        // Check if requester has enough credits
        const requester = await User.findByPk(userId);
        if (requester.credits < 5) {
            return res.status(400).json({ message: 'Insufficient credits. You need at least 5 credits to confirm.' });
        }

        // Update session with scheduled time and change status to Confirmed
        session.scheduled_time = scheduled_time;
        session.status = 'Confirmed';
        
        // Mark skill request as Closed so it doesn't appear in Open Requests anymore
        const skillRequest = await SkillRequest.findByPk(session.skillRequestId);
        if (skillRequest) {
            skillRequest.status = 'Closed';
            await skillRequest.save();
            console.log('✅ SkillRequest marked as Closed');
        }
        
        // Deduct 5 credits from requester, add 5 to provider
        const provider = await User.findByPk(session.providerId);
        requester.credits -= 5;
        provider.credits += 5;

        await session.save();
        await requester.save();
        await provider.save();

        // Create MeetingSession
        try {
            const MeetingSession = db.MeetingSession;
            
            console.log('🎥 Creating Daily.co meeting for session:', session.id);
            
            // Generate Daily.co meeting
            const dailyMeeting = createDailyMeeting(session.id, requester.full_name);
            console.log('📍 Daily.co meeting result:', dailyMeeting);
            
            if (!dailyMeeting.success) {
                throw new Error('Failed to create Daily.co meeting: ' + dailyMeeting.error);
            }
            
            console.log('✅ Daily.co meeting created:', dailyMeeting.meetingUrl);
            
            // Create meeting session with Daily.co provider
            const meetingSession = await MeetingSession.create({
                learner_name: requester.full_name,
                tutor_id: provider.id,
                learner_id: requester.id,
                status: 'scheduled',
                meeting_link: dailyMeeting.meetingUrl,
                video_provider: 'daily',
                provider_room_id: dailyMeeting.roomName,
                proposed_slots: [{
                    date: new Date(scheduled_time).toISOString().split('T')[0],
                    startTime: new Date(scheduled_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
                    endTime: new Date(new Date(scheduled_time).getTime() + 60 * 60 * 1000).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
                }],
                confirmed_slot: {
                    date: new Date(scheduled_time).toISOString().split('T')[0],
                    startTime: new Date(scheduled_time).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
                    endTime: new Date(new Date(scheduled_time).getTime() + 60 * 60 * 1000).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
                }
            });
            
            console.log('✅ MeetingSession DB record created:', meetingSession.id);
            
            // Update main session with meeting link
            session.meeting_link = dailyMeeting.meetingUrl;
            await session.save();
            
            console.log('✅✅ Meeting created successfully with link:', dailyMeeting.meetingUrl);
        } catch (error) {
            console.error('❌ Error creating MeetingSession:', error);
            console.error('Error details:', error.message);
            console.error('Stack:', error.stack);
            // Continue anyway
        }

        // Emit real-time event
        const io = req.app.locals.io;
        if (io) {
            io.emit('sessionStatusUpdated', {
                sessionId: session.id,
                requesterId: session.requesterId,
                providerId: session.providerId,
                status: 'Confirmed',
                scheduled_time,
                timestamp: new Date()
            });
        }

        res.json({ message: 'Session confirmed successfully', session });
    } catch (error) {
        console.error('Error confirming session:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get pending tutor offers for learner (Pending sessions with availability)
exports.getPendingOffers = async (req, res) => {
    try {
        const userId = req.user.id;
        const sessions = await Session.findAll({
            where: { 
                requesterId: userId,
                status: 'Pending'
            },
            include: [
                { model: User, as: 'requester', attributes: ['id', 'full_name', 'roll_no'] },
                { model: User, as: 'provider', attributes: ['id', 'full_name', 'roll_no'] },
                { model: Skill, as: 'skill', attributes: ['id', 'name', 'category'] },
                { model: SkillRequest, as: 'skillRequest', attributes: ['id', 'description', 'deadline'] }
            ],
            order: [['createdAt', 'DESC']]
        });
        res.json(sessions);
    } catch (error) {
        console.error('Error in getPendingOffers:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get user's active/upcoming meetings
exports.getUserMeetings = async (req, res) => {
    try {
        const userId = req.user.id;
        
        console.log('📍 [MEETINGS] Getting meetings for user:', userId);
        
        // Raw SQL with LEFT JOINs to get tutor and learner user details
        const meetings = await db.sequelize.query(`
            SELECT 
                m.id,
                m.learner_name,
                m.tutor_id,
                m.learner_id,
                m.status,
                m.meeting_link,
                m.video_provider,
                m.provider_room_id,
                m.confirmed_slot,
                m."createdAt",
                m."updatedAt",
                json_build_object(
                    'id', t.id,
                    'full_name', t.full_name,
                    'email', t.email
                ) as tutor,
                json_build_object(
                    'id', l.id,
                    'full_name', l.full_name,
                    'email', l.email
                ) as learner
            FROM "MeetingSessions" m
            LEFT JOIN "Users" t ON m.tutor_id = t.id
            LEFT JOIN "Users" l ON m.learner_id = l.id
            WHERE (m.tutor_id = :userId OR m.learner_id = :userId)
            AND m.status IN ('pending', 'scheduled')
            ORDER BY m."createdAt" DESC
        `, {
            replacements: { userId },
            type: db.Sequelize.QueryTypes.SELECT
        });
        
        console.log(`✅ [MEETINGS] Found ${meetings.length} meetings for user ${userId}`);
        if (meetings.length > 0) {
            console.log('📊 [MEETINGS] Sample meeting:', JSON.stringify(meetings[0], null, 2));
        }
        
        res.json(meetings);
    } catch (error) {
        console.error('❌ [MEETINGS] Error:', error.message);
        console.error('📋 [MEETINGS] Stack:', error.stack);
        res.status(500).json({ 
            message: 'Failed to fetch meetings', 
            error: error.message
        });
    }
};

// Complete a meeting session
exports.completeMeeting = async (req, res) => {
    try {
        const { meetingId } = req.params;
        const userId = req.user.id;
        
        const MeetingSession = db.MeetingSession;
        const meeting = await MeetingSession.findByPk(meetingId);
        
        if (!meeting) {
            return res.status(404).json({ message: 'Meeting not found' });
        }
        
        // Verify user is part of the meeting
        if (meeting.tutor_id !== userId && meeting.learner_id !== userId) {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        
        // Update meeting status
        meeting.status = 'completed';
        await meeting.save();
        
        // Also update the session status
        const session = await Session.findOne({
            where: { meeting_link: meeting.meeting_link }
        });
        
        if (session) {
            session.status = 'Completed';
            await session.save();
        }
        
        res.json({ message: 'Meeting marked as completed', meeting });
    } catch (error) {
        console.error('Error completing meeting:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
