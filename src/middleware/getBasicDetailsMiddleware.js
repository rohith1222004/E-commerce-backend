const User = require('../models/userSchema'); // Assuming user schema is here

const getBasicDetails = async (req, res, next) => {
  const { userName, email, phone, location } = req.body;

  if (!userName || !email || !phone || !location) {
    return res.status(400).json({
      error: "Please provide your name, email, phone number, and location.",
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid email format." });
  }

  const phoneRegex = /^[0-9]{10}$/;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({ error: "Invalid phone number format. It should be 10 digits." });
  }

  if (typeof location !== "string" || location.trim().length === 0) {
    return res.status(400).json({ error: "Location must be a non-empty string." });
  }

  try {
    let user = await User.findOne({ email });
    if (!user)  {
      user = new User({
        userName,
        email,
        phone,
        location,
      });

      await user.save();
    }

    req.user = user;
    req.isAuthenticated = true;
    console.log(req.user);
    
    return next();
  } catch (err) {
    console.error("Error updating or creating user:", err);
    return res.status(500).json({ error: "Error updating user details." });
  }
};

module.exports = { getBasicDetails };
