/**
 * Daily.co Video Meeting Service
 * Handles creation and management of Daily.co meeting rooms
 */

const crypto = require('crypto');

// Daily.co room name format: skillexchange-SESSION_ID-TIMESTAMP
const generateDailyRoomName = (meetingId) => {
    const timestamp = Date.now().toString(36);
    return `skillexchange-${meetingId.substring(0, 8)}-${timestamp}`;
};

/**
 * Create a Daily.co meeting URL
 * @param {string} meetingId - Unique meeting session ID
 * @param {string} userName - Name of the user joining
 * @returns {object} { roomName, meetingUrl, iframeUrl }
 */
const createDailyMeeting = (meetingId, userName = 'User') => {
    try {
        // Generate room name (unique per meeting)
        const roomName = generateDailyRoomName(meetingId);

        // Daily.co free tier URL format
        // No authentication needed, simple direct URL
        const meetingUrl = `https://daily.co/${roomName}`;
        
        // For iframe embedding with config
        const iframeUrl = `https://daily.co/${roomName}#config.roundtableVideo=false&config.customTrayButtons=[]`;

        return {
            success: true,
            roomName,
            meetingUrl,
            iframeUrl,
            provider: 'daily',
            features: {
                maxParticipants: 2,
                callDurationLimit: 45 * 60 * 1000, // 45 minutes in milliseconds
                requiresAuth: false,
                supportScreenShare: true,
                supportRecording: true,
                supportChat: true,
            },
            notes: 'Daily.co free tier: 45 minute call limit, 2 participants recommended'
        };
    } catch (error) {
        console.error('Error creating Daily.co meeting:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

/**
 * Validate Daily.co room name
 * @param {string} roomName - Room name to validate
 * @returns {boolean}
 */
const isValidDailyRoomName = (roomName) => {
    // Daily.co room names: alphanumeric, hyphens, underscores, 3-128 chars
    return /^[a-zA-Z0-9-_]{3,128}$/.test(roomName);
};

/**
 * Get Daily.co meeting link from room name
 * @param {string} roomName - Daily.co room name
 * @returns {string} Full meeting URL
 */
const getDailyMeetingLink = (roomName) => {
    return `https://daily.co/${roomName}`;
};

/**
 * Get iframe embed code for Daily.co
 * @param {string} roomName - Daily.co room name
 * @param {object} config - Optional configuration
 * @returns {string} Iframe HTML
 */
const getDailyIframeCode = (roomName, config = {}) => {
    const configParams = Object.entries(config)
        .map(([key, value]) => `config.${key}=${encodeURIComponent(value)}`)
        .join('&');
    
    const url = configParams 
        ? `https://daily.co/${roomName}#${configParams}`
        : `https://daily.co/${roomName}`;

    return `<iframe allow="camera; microphone; display-capture; autoplay; clipboard-read; clipboard-write" src="${url}" style="width: 100%; height: 100%; border: none;"></iframe>`;
};

module.exports = {
    generateDailyRoomName,
    createDailyMeeting,
    isValidDailyRoomName,
    getDailyMeetingLink,
    getDailyIframeCode
};
