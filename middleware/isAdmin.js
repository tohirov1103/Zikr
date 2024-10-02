const {getConnection} = require('../db/connectDb'); // Make sure to import your DB connection

// Middleware to check if the user is the admin of the group
const isAdminOfThatGroup = async (req, res, next) => {
  try {
    const userId = req.user.id; 
    const groupId = req.params.id; 

    console.log(userId);

    if (!userId || !groupId) {
      return res.status(400).json({ message: "User ID and Group ID are required" });
    }

    const connection = await getConnection();
    
    const query = `
      SELECT role FROM group_members
      WHERE user_id = ? AND group_id = ? AND role = 'admin'
    `;
    const [result] = await connection.query(query, [userId, groupId]);

    if (result.length === 0) {
      return res.status(403).json({ message: "You are not authorized to perform this action" });
    }

    // If the user is an admin, proceed to the next middleware or route handler
    next();
  } catch (err) {
    console.error("Error checking admin status:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = isAdminOfThatGroup;
