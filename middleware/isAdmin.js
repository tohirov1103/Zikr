const {getConnection} = require('../db/connectDb');

const isAdmin = async (req, res, next) => {
    try {
      const idGroup = req.params.id;
      const userId = req.body.id;
      const connection = await getConnection();
  
      const query = 'SELECT adminId FROM `Group` WHERE idGroup = ?';
      
      // Execute the query to find the adminId for the given group
      const [rows] = await connection.query(query, [idGroup]);
  
      // Check if the group was found
      if (rows.length === 0) {
        return res.status(404).json({ message: "Group not found" });
      }
  
      const adminId = rows[0].adminId;
  
      // Check if the current user is the admin
      if (adminId !== userId) {
        return res.status(403).json({ message: "Access denied: User is not the admin of this group" });
      }
  
      // If the user is the admin, proceed to the next middleware
      next();
    } catch (error) {
      console.error("Error in isAdmin middleware:", error);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
module.exports = {isAdmin};