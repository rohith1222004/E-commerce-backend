const User = require("../models/userSchema");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const encryptAndStore = async (name, email, password, role) => {
  const user = await User.findOne({
    email: email
  });
  if (user) {
    return "Email already exists";
  }
  const salt = 10;
  bcrypt.hash(password, salt, (err, hashPassword) => {
    if (err) {
      console.log(err);
      return;
    }
    console.log('Hashed password:', hashPassword);
    const user = new User({
      userName: name,
      email: email,
      password: hashPassword,
      role: role
    });
    user.save().then(() => console.log('User created successfully')).catch(err => console.log(err));
  });
  return "User created successfully";
};
const loginAndGenerateToken = async (email, password) => {
  const user = await User.findOne({
    email: email
  });
  if (!user) {
    return "User not found";
  }
  console.log("User Details", user);
  const passwordMatch = await bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return "Invalid Token";
  }
  const token = jwt.sign({
    userId: user._id,
    role: user.role
  }, process.env.JWT_SECRET, {
    expiresIn: '1h'
  });
  console.log("token : ", token);
  return token;
};
module.exports = {
  encryptAndStore,
  loginAndGenerateToken
};