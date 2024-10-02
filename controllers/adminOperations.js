const { getConnection } = require('../db/connectDb');

// Change the name of a group
const changeNameOfGroup = async (req, res) => {
  try {
    const idGroup = req.params.id;
    const newName = req.body.newName;

    console.log(newName);
    

    const connection = await getConnection();

    const query = 'UPDATE `Group` SET name = ? WHERE idGroup = ?';
    const [result] = await connection.query(query, [newName, idGroup]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Group not found" });
    }

    res.json({ message: `Name of group successfully changed to ${newName}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


// Delete a user from a group
const deleteUser = async (req, res) => {
  try {
    const idGroup = req.params.id;  // The ID of the group
    const userId = req.query.userId;  // The ID of the user to be removed
    const connection = await getConnection();

    // Remove the user from the group_members table where group_id and user_id match
    const query = `DELETE FROM group_members WHERE group_id = ? AND user_id = ?`;
    const [result] = await connection.query(query, [idGroup, userId]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "User or group not found, or user is not part of the group" });
    }

    res.json({ message: `User with ID ${userId} successfully removed from group ${idGroup}` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};


module.exports = {
  changeNameOfGroup,
  deleteUser,
};
