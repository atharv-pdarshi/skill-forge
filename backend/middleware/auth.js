const jwt = require('jsonwebtoken');
const config = process.env;

const verifyToken = (req, res, next) => {
  let token = null;

  // 1. Check Authorization header
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7, authHeader.length); 
  }

  // 2. If not found, check x-access-token header
  if (!token && req.headers['x-access-token']) {
    token = req.headers['x-access-token'];
  }

  // 3. If still not found, check body
  if (!token && req.body && req.body.token) {
    token = req.body.token;
  }

  // 4. If still not found, check query parameters
  if (!token && req.query && req.query.token) {
    token = req.query.token;
  }

  // Log what's being received

  if (!token) {
    return res.status(403).send('A token is required for authentication');
  }

  try {
    const decoded = jwt.verify(token, config.TOKEN_KEY);
    req.user = decoded;
  } catch (err) {
    // console.error("Token verification error:", err.message); // Log specific JWT error
    return res.status(401).send('Invalid Token');
  }

  return next();
};

module.exports = verifyToken;