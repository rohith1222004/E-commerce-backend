const validateRegisterInput = (req, res, next) => {
    const { userName, email, password, role } = req.body;

    if (!userName || !email || !password || !role) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Invalid email format' });
    }
    
    if (password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long' });
    }
    
    next();
};

module.exports = validateRegisterInput;
