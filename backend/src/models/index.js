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
db.MeetingSession = require('./meetingSession.model')(sequelize, DataTypes);
db.QuizCategory = require('./quizCategory.model')(sequelize, DataTypes);
db.QuizQuestion = require('./quizQuestion.model')(sequelize, DataTypes);
db.QuizAttempt = require('./quizAttempt.model')(sequelize, DataTypes);
db.Feedback = require('./feedback.model')(sequelize, DataTypes);

// Associations

// User <-> Skill (via UserSkill)
db.User.belongsToMany(db.Skill, { through: db.UserSkill, foreignKey: 'userId', as: 'offeredSkills' });
db.Skill.belongsToMany(db.User, { through: db.UserSkill, foreignKey: 'skillId', as: 'providers' });

// UserSkill -> User and Skill (direct associations)
db.UserSkill.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });
db.UserSkill.belongsTo(db.Skill, { foreignKey: 'skillId', as: 'skill' });
db.User.hasMany(db.UserSkill, { foreignKey: 'userId', as: 'userSkills' });
db.Skill.hasMany(db.UserSkill, { foreignKey: 'skillId', as: 'userSkills' });

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

// SkillRequest -> Session (A session references a skill request)
db.SkillRequest.hasMany(db.Session, { foreignKey: 'skillRequestId', as: 'sessions' });
db.Session.belongsTo(db.SkillRequest, { foreignKey: 'skillRequestId', as: 'skillRequest' });

// Quiz Associations
db.QuizCategory.hasMany(db.QuizQuestion, { foreignKey: 'categoryId', as: 'questions' });
db.QuizQuestion.belongsTo(db.QuizCategory, { foreignKey: 'categoryId', as: 'category' });

db.User.hasMany(db.QuizAttempt, { foreignKey: 'userId', as: 'quizAttempts' });
db.QuizAttempt.belongsTo(db.User, { foreignKey: 'userId', as: 'user' });

db.QuizCategory.hasMany(db.QuizAttempt, { foreignKey: 'categoryId', as: 'attempts' });
db.QuizAttempt.belongsTo(db.QuizCategory, { foreignKey: 'categoryId', as: 'category' });

// Meeting Sessions Associations
db.User.hasMany(db.MeetingSession, { foreignKey: 'tutor_id', as: 'tutoredMeetings' });
db.MeetingSession.belongsTo(db.User, { foreignKey: 'tutor_id', as: 'tutor' });

db.User.hasMany(db.MeetingSession, { foreignKey: 'learner_id', as: 'learningMeetings' });
db.MeetingSession.belongsTo(db.User, { foreignKey: 'learner_id', as: 'learner' });

// Feedback Associations
db.User.hasMany(db.Feedback, { foreignKey: 'from_user_id', as: 'givenFeedback' });
db.Feedback.belongsTo(db.User, { foreignKey: 'from_user_id', as: 'fromUser' });

db.User.hasMany(db.Feedback, { foreignKey: 'to_user_id', as: 'receivedFeedback' });
db.Feedback.belongsTo(db.User, { foreignKey: 'to_user_id', as: 'toUser' });

db.MeetingSession.hasMany(db.Feedback, { foreignKey: 'session_id', as: 'feedbacks' });
db.Feedback.belongsTo(db.MeetingSession, { foreignKey: 'session_id', as: 'session' });

module.exports = db;
