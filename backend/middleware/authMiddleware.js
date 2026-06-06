const jwt = require('jsonwebtoken');
const prisma = require('../prismaClient');

// Protect routes - verifies JWT and attaches user to req
exports.protect = async (req, res, next) => {
  let token;

  try {
    // Check if token is passed in the Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ error: 'Not authorized to access this route. No token provided.' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_fallback_key');

    // Find the user by ID from the decoded JWT payload
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user) {
      return res.status(401).json({ error: 'The user belonging to this token no longer exists.' });
    }

    // Attach user payload to request (excluding password)
    const { password, ...userWithoutPassword } = user;
    req.user = userWithoutPassword;

    next();
  } catch (error) {
    console.error('Auth Middleware Error:', error);
    return res.status(401).json({ error: 'Not authorized to access this route. Invalid token.' });
  }
};

// Grant access to specific roles only
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `User role '${req.user ? req.user.role : 'Unknown'}' is not authorized to access this route.` 
      });
    }
    next();
  };
};