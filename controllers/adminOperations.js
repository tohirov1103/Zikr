const { getConnection } = require('../db/connectDb');

// Change the name of a group
const changeNameOfGroup = async (req, res) => {
  try {
    const idGroup = req.params.id;
    const newName = req.body.name;
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
    const idGroup = req.params.id;
    const userId = req.body.id;
    const connection = await getConnection();

    // Remove the user from the group's usersId JSON array
    const query = `UPDATE \`Group\` SET usersId = JSON_REMOVE(usersId, JSON_UNQUOTE(JSON_SEARCH(usersId, 'one', ?))) WHERE idGroup = ? AND JSON_SEARCH(usersId, 'one', ?) IS NOT NULL`
    const [result] = await connection.query(query, [userId, idGroup]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Group or user not found" });
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
