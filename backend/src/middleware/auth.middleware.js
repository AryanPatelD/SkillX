const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('JWT Verification Error:', error.message);
        console.error('Token:', token ? token.substring(0, 50) + '...' : 'No token');
        console.error('JWT_SECRET exists:', !!process.env.JWT_SECRET);
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: 'Token expired. Please login again.' });
        }
        
        res.status(401).json({ message: 'Invalid token. ' + error.message });
    }
};
