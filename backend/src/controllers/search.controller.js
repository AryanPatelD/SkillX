const db = require('../models');
const Skill = db.Skill;
const User = db.User;
const SkillRequest = db.SkillRequest;
const Session = db.Session;
const { Op } = require('sequelize');

exports.searchOfferedSkills = async (req, res) => {
    try {
        const { q } = req.query;

        const whereClause = {};
        if (q) {
            whereClause[Op.or] = [
                { name: { [Op.iLike]: `%${q}%` } },
                { category: { [Op.iLike]: `%${q}%` } }
            ];
        }

        const skills = await Skill.findAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'providers',
                    attributes: ['id', 'full_name', 'roll_no', 'bio'],
                    through: { attributes: ['proficiency'] },
                    required: true,
                },
            ],
            distinct: true,
        });

        res.json(skills);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.searchRequests = async (req, res) => {
    try {
        const { q } = req.query;

        const whereClause = {
            status: 'Open',
        };

        if (q) {
            whereClause[Op.or] = [
                { description: { [Op.iLike]: `%${q}%` } },
            ];
        }

        if (req.user) {
            whereClause.requesterId = { [Op.ne]: req.user.id };
        }

        const requests = await SkillRequest.findAll({
            where: whereClause,
            include: [
                {
                    model: User,
                    as: 'requester',
                    attributes: ['id', 'full_name', 'roll_no'],
                },
                {
                    model: Skill,
                    as: 'skill',
                    where: q ? { name: { [Op.iLike]: `%${q}%` } } : undefined,
                    required: false, // Allow searching by description even if skill name doesn't match
                },
            ],
        });

        // Filter out requests where current user has already offered to help (has a session as provider)
        let filteredRequests = requests;
        if (req.user) {
            const userSessionIds = await Session.findAll({
                where: {
                    providerId: req.user.id,
                    status: { [Op.in]: ['Pending', 'Confirmed'] },
                },
                attributes: ['skillRequestId'],
            });
            const userOfferedRequestIds = userSessionIds.map(s => s.skillRequestId);
            filteredRequests = requests.filter(r => !userOfferedRequestIds.includes(r.id));
        }

        res.json(filteredRequests);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
