const db = require('../models');
const User = db.User;
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { email, password, full_name, bio, roll_no } = req.body;

        if (!roll_no) {
            return res.status(400).json({ message: 'Roll number is required' });
        }

        // Check if email exists
        const existingEmailUser = await User.findOne({ where: { email } });
        if (existingEmailUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Check if roll_no already exists
        const existingRollUser = await User.findOne({ where: { roll_no } });
        if (existingRollUser) {
            return res.status(400).json({ message: 'Roll number already registered' });
        }

        // Hash password
        const password_hash = await bcrypt.hash(password, 10);

        // Create user with initial 10 credits
        const user = await User.create({
            email,
            roll_no,
            password_hash,
            full_name,
            bio,
            credits: 10,
        });

        // Generate token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: '1d',
        });

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user.id,
                email: user.email,
                roll_no: user.roll_no,
                full_name: user.full_name,
                credits: user.credits,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, roll_no, password } = req.body;

        if (!email && !roll_no) {
            return res.status(400).json({ message: 'Please provide email or roll number' });
        }

        // Find user by email or roll_no
        let user;
        if (email) {
            user = await User.findOne({ where: { email } });
        } else if (roll_no) {
            user = await User.findOne({ where: { roll_no } });
        }

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
            expiresIn: '1d',
        });

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                roll_no: user.roll_no,
                full_name: user.full_name,
                credits: user.credits,
            },
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
