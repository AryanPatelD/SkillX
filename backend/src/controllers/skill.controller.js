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
exports.offerSkill = async (req, res) => {
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
        res.status(201).json({ message: 'Skill offered successfully', userSkill });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Request a skill (User creates a request)
exports.requestSkill = async (req, res) => {
    try {
        const { skillId, description } = req.body;
        const requesterId = req.user.id;

        const request = await SkillRequest.create({
            requesterId,
            skillId,
            description,
        });

        res.status(201).json({ message: 'Skill requested successfully', request });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get user's offered skills
exports.getMySkills = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findByPk(userId, {
            include: [
                {
                    model: Skill,
                    as: 'offeredSkills',
                    through: { attributes: ['proficiency'] },
                },
            ],
        });
        res.json(user ? user.offeredSkills : []);
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
