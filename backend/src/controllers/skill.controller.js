const db = require('../models');
const Skill = db.Skill;
const UserSkill = db.UserSkill;
const SkillRequest = db.SkillRequest;
const User = db.User;

// Get all available skills
exports.getAllSkills = async (req, res) => {
    try {
        const skills = await Skill.findAll();
        res.json(skills);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Add a new skill (Admin or User if allowed)
exports.addSkill = async (req, res) => {
    try {
        const { name, category } = req.body;
        // Use findOrCreate to handle duplicate names gracefully
        const [skill, created] = await Skill.findOrCreate({
            where: { name },
            defaults: { category }
        });
        res.status(created ? 201 : 200).json(skill);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Offer a skill (User adds skill to their profile)
exports.offerSkill = async (req, res, io) => {
    try {
        const { skillId, proficiency } = req.body;
        const userId = req.user.id;
        console.log(`[DEBUG] User ${userId} offering skill ${skillId} (${proficiency})`);

        const userSkill = await UserSkill.create({
            userId,
            skillId,
            proficiency,
        });

        console.log('[DEBUG] UserSkill created ID:', userSkill.id);
        
        // Emit real-time event
        const io = req.app.locals.io;
        if (io) {
            io.emit('skillOffered', {
                userId,
                skillId,
                proficiency,
                userSkillId: userSkill.id,
                timestamp: new Date()
            });
        }

        res.status(201).json({ message: 'Skill offered successfully', userSkill });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Request a skill (User creates a request)
exports.requestSkill = async (req, res) => {
    try {
        const { skillId, description, deadline } = req.body;
        const requesterId = req.user.id;

        const request = await SkillRequest.create({
            requesterId,
            skillId,
            description,
            deadline: deadline || null,
        });

        // Emit real-time event
        const io = req.app.locals.io;
        if (io) {
            io.emit('skillRequested', {
                requestId: request.id,
                requesterId,
                skillId,
                description,
                deadline,
                status: request.status,
                timestamp: new Date()
            });
        }

        res.status(201).json({ message: 'Skill requested successfully', request });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get user's offered skills
exports.getMySkills = async (req, res) => {
    try {
        const userId = req.user.id;
        // Query from UserSkill directly to get proficiency at top level
        const userSkills = await UserSkill.findAll({
            where: { userId },
            include: [
                {
                    model: Skill,
                    as: 'skill',
                    attributes: ['id', 'name', 'category']
                }
            ]
        });

        // Transform response to include proficiency and skill details at top level
        const skills = userSkills.map(us => ({
            id: us.skill.id,
            name: us.skill.name,
            category: us.skill.category,
            proficiency: us.proficiency,
            userSkillId: us.id
        }));

        res.json(skills);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get user's requests
exports.getMyRequests = async (req, res) => {
    try {
        const userId = req.user.id;
        const requests = await SkillRequest.findAll({
            where: { requesterId: userId },
            include: [{ model: Skill, as: 'skill' }],
        });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update offered skill (proficiency level)
exports.updateOfferedSkill = async (req, res) => {
    try {
        const { skillId } = req.params;
        const { proficiency } = req.body;
        const userId = req.user.id;

        if (!['Beginner', 'Intermediate', 'Expert'].includes(proficiency)) {
            return res.status(400).json({ message: 'Invalid proficiency level' });
        }

        const userSkill = await UserSkill.findOne({
            where: { userId, skillId }
        });

        if (!userSkill) {
            return res.status(404).json({ message: 'Skill not found' });
        }

        userSkill.proficiency = proficiency;
        await userSkill.save();

        console.log(`✅ User ${userId} updated skill ${skillId} to ${proficiency}`);
        res.json({ message: 'Skill updated successfully', userSkill });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete offered skill
exports.deleteOfferedSkill = async (req, res) => {
    try {
        const { skillId } = req.params;
        const userId = req.user.id;

        const userSkill = await UserSkill.findOne({
            where: { userId, skillId }
        });

        if (!userSkill) {
            return res.status(404).json({ message: 'Skill not found' });
        }

        await userSkill.destroy();

        console.log(`✅ User ${userId} deleted skill ${skillId}`);

        // Emit real-time event
        const io = req.app.locals.io;
        if (io) {
            io.emit('skillRemoved', {
                userId,
                skillId,
                timestamp: new Date()
            });
        }

        res.json({ message: 'Skill deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update skill request (description, deadline)
exports.updateSkillRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { description, deadline } = req.body;
        const userId = req.user.id;

        const request = await SkillRequest.findByPk(requestId);

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (request.requesterId !== userId) {
            return res.status(403).json({ message: 'You can only update your own requests' });
        }

        // Only allow updates if request is still Open
        if (request.status !== 'Open') {
            return res.status(400).json({ message: 'Can only update open requests' });
        }

        // Validate deadline if provided
        if (deadline) {
            const selectedDate = new Date(deadline);
            const now = new Date();
            if (selectedDate < now) {
                return res.status(400).json({ message: 'Deadline cannot be in the past' });
            }
        }

        if (description) request.description = description;
        if (deadline) request.deadline = deadline;

        await request.save();

        console.log(`✅ User ${userId} updated request ${requestId}`);

        // Emit real-time event
        const io = req.app.locals.io;
        if (io) {
            io.emit('requestUpdated', {
                requestId,
                description,
                deadline,
                timestamp: new Date()
            });
        }

        res.json({ message: 'Request updated successfully', request });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete skill request
exports.deleteSkillRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const userId = req.user.id;

        const request = await SkillRequest.findByPk(requestId);

        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (request.requesterId !== userId) {
            return res.status(403).json({ message: 'You can only delete your own requests' });
        }

        await request.destroy();

        console.log(`✅ User ${userId} deleted request ${requestId}`);

        // Emit real-time event
        const io = req.app.locals.io;
        if (io) {
            io.emit('requestDeleted', {
                requestId,
                timestamp: new Date()
            });
        }

        res.json({ message: 'Request deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
