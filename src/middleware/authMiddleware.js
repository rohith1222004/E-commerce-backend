const jwt = require('jsonwebtoken');
require('dotenv').config()

const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')

    if (!token) {
      req.isAuthenticated = false;
      return next();
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        req.isAuthenticated = false;
        return next();
      }
      req.isAuthenticated = true;
      req.user = user;     
      next();
    });
}

const isAuthenticated = (req, res, next) => {
  if (req.isAuthenticated) {
      next();
  } else {
      return res.status(401).json({ 
          message: "You need to provide some basic information.", 
          redirectTo: "/register-or-login" 
      });
  }
};

const authorizeRole = (role) => (req, res, next) => {
    console.log(role);
    console.log(req.user);
    
    if (req.user.role !== role) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
};

module.exports={
    authenticateToken,
    authorizeRole,
    isAuthenticated
}