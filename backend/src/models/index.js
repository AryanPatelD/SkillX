const sequelize = require('../config/database');
const { Sequelize, DataTypes } = require('sequelize');

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.User = require('./user.model')(sequelize, DataTypes);
db.Skill = require('./skill.model')(sequelize, DataTypes);
db.UserSkill = require('./userSkill.model')(sequelize, DataTypes);
db.SkillRequest = require('./skillRequest.model')(sequelize, DataTypes);
db.Session = require('./session.model')(sequelize, DataTypes);

// Associations

// User <-> Skill (via UserSkill)
db.User.belongsToMany(db.Skill, { through: db.UserSkill, foreignKey: 'userId', as: 'offeredSkills' });
db.Skill.belongsToMany(db.User, { through: db.UserSkill, foreignKey: 'skillId', as: 'providers' });

// User -> SkillRequest (Requester)
db.User.hasMany(db.SkillRequest, { foreignKey: 'requesterId', as: 'requests' });
db.SkillRequest.belongsTo(db.User, { foreignKey: 'requesterId', as: 'requester' });

// Skill -> SkillRequest
db.Skill.hasMany(db.SkillRequest, { foreignKey: 'skillId', as: 'requests' });
db.SkillRequest.belongsTo(db.Skill, { foreignKey: 'skillId', as: 'skill' });

// Sessions
db.User.hasMany(db.Session, { foreignKey: 'requesterId', as: 'requestedSessions' });
db.Session.belongsTo(db.User, { foreignKey: 'requesterId', as: 'requester' });

db.User.hasMany(db.Session, { foreignKey: 'providerId', as: 'providedSessions' });
db.Session.belongsTo(db.User, { foreignKey: 'providerId', as: 'provider' });

db.Skill.hasMany(db.Session, { foreignKey: 'skillId', as: 'sessions' });
db.Session.belongsTo(db.Skill, { foreignKey: 'skillId', as: 'skill' });

module.exports = db;
