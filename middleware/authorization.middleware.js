const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: "Authentication token required" });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded.userId };  // Assuming the token was encoded with an object containing the userId
        next();
    } catch (error) {
        console.error("Authentication error:", error);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};

module.exports = authenticate;
