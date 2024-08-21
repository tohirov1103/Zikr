const { getConnection } = require("../db/connectDb");

// Helper function for consistent response creation
function createResponse(status, message, data = null) {
  return { status, message, data };
}

// Example validation (can be expanded for all functions)
const validateCreateGroup = ({ name, numOfUsers, usersId, isPublic, kimga, guruhImg, hatmSoni }) => {
  return name && numOfUsers && usersId && isPublic !== undefined && kimga && guruhImg && hatmSoni;
};

const createGroup = async (req, res) => {
  const { name, numOfUsers, usersId, isPublic, kimga, guruhImg, hatmSoni } = req.body;
  const adminId = req.params.id;

  if (!validateCreateGroup(req.body)) {
    return res.status(400).json(createResponse("400", "Invalid input data"));
  }

  try {
    const connection = await getConnection();
    const insertGroupQuery = `
      INSERT INTO \`Group\` (name, adminId, numOfUsers, usersId, isPublic, kimga, guruhImg, hatmSoni)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await connection.query(insertGroupQuery, [name, adminId, numOfUsers, usersId, isPublic, kimga, guruhImg, hatmSoni]);

    if (result.affectedRows === 0) {
      return res.status(404).json(createResponse("404", "Group not created"));
    }

    const insertFinishedPoralarCountQuery = `
      INSERT INTO finishedPoralarCount (idGroup) VALUES (?)
    `;
    await connection.query(insertFinishedPoralarCountQuery, [result.insertId]);

    return res.json(createResponse("200", "Group has been created", { groupId: result.insertId }));
  } catch (err) {
    console.error(err);
    return res.status(500).json(createResponse("500", "Internal server error"));
  }
};

const updateGroup = async (req, res) => {
  const { name, numOfUsers, isPublic, kimga, guruhImg, hatmSoni } = req.body;
  const groupId = req.params.id;

  if (!groupId || !name || !numOfUsers || isPublic === undefined || !kimga || !guruhImg || !hatmSoni) {
    return res.status(400).json(createResponse("400", "Invalid input data"));
  }

  try {
    const connection = await getConnection();
    const updateGroupQuery = `
      UPDATE \`Group\`
      SET name = ?, numOfUsers = ?, isPublic = ?, kimga = ?, guruhImg = ?, hatmSoni = ?
      WHERE idGroup = ?
    `;
    const [result] = await connection.query(updateGroupQuery, [name, numOfUsers, isPublic, kimga, guruhImg, hatmSoni, groupId]);

    if (result.affectedRows === 0) {
      return res.status(404).json(createResponse("404", "Group not found"));
    }

    return res.json(createResponse("200", "Group has been updated", { groupId }));
  } catch (err) {
    console.error(err);
    return res.status(500).json(createResponse("500", "Internal server error"));
  }
};

const getGroups = async (req, res, isPublic) => {
  try {
    const connection = await getConnection();
    const userId = req.params.id;
    const query = `
      SELECT * FROM \`Group\`
      WHERE JSON_CONTAINS(usersId, ?, '$') AND isPublic = ?
    `;
    const [groups] = await connection.query(query, [userId, isPublic]);

    return res.json(createResponse("200", "Success", groups));
  } catch (err) {
    console.error(err);
    return res.status(500).json(createResponse("500", "Internal server error"));
  }
};

const getAllGroups = async (req, res) => {
  try {
    const connection = await getConnection();
    const query = "SELECT * FROM `Group`";
    const [groups] = await connection.query(query);
    return res.json(createResponse("200", "Success", groups));
  } catch (err) {
    console.error(err);
    return res.status(500).json(createResponse("500", "Internal server error"));
  }
};

const getPublicGroups = (req, res) => getGroups(req, res, true);
const getPrivateGroups = (req, res) => getGroups(req, res, false);

const showGroupProfile = async (req, res) => {
  try {
    const connection = await getConnection();
    const groupId = req.params.id;

    const query = "SELECT name, kimga, hatmSoni FROM `Group` WHERE idGroup = ?";
    const [groupProfile] = await connection.query(query, [groupId]);

    if (groupProfile.length === 0) {
      return res.status(404).json(createResponse("404", "Group not found"));
    }

    return res.json(createResponse("200", "Success", groupProfile[0]));
  } catch (error) {
    console.error(error);
    return res.status(500).json(createResponse("500", "Internal Server Error"));
  }
};

const showGroupSubs = async (req, res) => {
  try {
    const connection = await getConnection();
    const idGroup = req.params.id;

    const query = "SELECT usersId FROM `Group` WHERE idGroup = ?";
    const [result] = await connection.query(query, [idGroup]);

    if (result.length === 0) {
      return res.status(404).json(createResponse("404", "Group not found"));
    }

    const idsString = result[0].usersId.replace(/[\[\]']+/g, '').split(',').map(Number).join(',');
    const userQuery = `SELECT name, surname, phone FROM user WHERE find_in_set(userId, ?) > 0`;

    const [users] = await connection.query(userQuery, [idsString]);

    return res.json(createResponse("200", "Success", users));
  } catch (err) {
    console.error(err);
    return res.status(500).json(createResponse("500", "Internal server error"));
  }
};

const deleteGroup = async (req, res) => {
  try {
    const connection = await getConnection();
    const groupId = req.params.id;

    const deleteQuery = "DELETE FROM `Group` WHERE idGroup = ?";
    const [result] = await connection.query(deleteQuery, [groupId]);

    if (result.affectedRows === 0) {
      return res.status(404).json(createResponse("404", "Group not found"));
    }

    return res.json(createResponse("200", "Group has been deleted", { groupId }));
  } catch (err) {
    console.error(err);
    return res.status(500).json(createResponse("500", "Internal server error"));
  }
};

const findUser = async (req, res) => {
  try {
    const connection = await getConnection();
    const phonenumber = req.query.phonenumber;
    const query = "SELECT * FROM `user` WHERE phonenumber = ?";
    const [user] = await connection.query(query, [phonenumber]);

    if (user.length === 0) {
      return res.status(404).json(createResponse("404", "User not found"));
    }

    return res.json(createResponse("200", "Success", user[0]));
  } catch (err) {
    console.error(err);
    return res.status(500).json(createResponse("500", "Internal server error"));
  }
};

const inviteUser = async (req, res) => {
  try {
    const connection = await getConnection();
    const receiverId = req.params.id;
    const { senderId, groupId, isInvite } = req.body;

    // Check if the user is already in the group
    const checkQuery = "SELECT JSON_CONTAINS(usersId, ?, '$') AS isInGroup FROM `Group` WHERE idGroup = ?";
    const [checkResult] = await connection.query(checkQuery, [receiverId, groupId]);

    if (checkResult[0].isInGroup) {
      return res.status(400).json(createResponse("400", "User is already in the group"));
    }

    const insertQuery = "INSERT INTO notifications (senderId, receiverId, groupId, isInvite) VALUES (?, ?, ?, ?)";
    await connection.query(insertQuery, [senderId, receiverId, groupId, isInvite]);

    return res.json(createResponse("200", "Invitation sent", { groupId, receiverId }));
  } catch (error) {
    console.error(error);
    return res.status(500).json(createResponse("500", "Internal server error"));
  }
};

const subscribeUser = async (req, res) => {
  try {
    const connection = await getConnection();
    const { userId, groupId } = req.body;

    const groupQuery = `
      UPDATE \`Group\`
      SET usersId = JSON_ARRAY_APPEND(usersId, '$', ?)
      WHERE idGroup = ?
    `;
    await connection.query(groupQuery, [userId, groupId]);

    const userQuery = `
      UPDATE \`user\`
      SET \`groups\` = JSON_ARRAY_APPEND(\`groups\`, '$', ?)
      WHERE \`userId\` = ?
    `;
    await connection.query(userQuery, [groupId, userId]);

    return res.json(createResponse("200", "User subscribed to the group", { userId, groupId }));
  } catch (error) {
    console.error(error);
    return res.status(500).json(createResponse("500", "Internal server error"));
  }
};

const getInvites = async (req, res) => {
  try {
    const connection = await getConnection();
    const userId = req.params.id;
    const query = "SELECT * FROM notifications WHERE isInvite = true AND receiverId = ?";
    const [invites] = await connection.query(query, [userId]);

    return res.json(createResponse("200", "Success", invites));
  } catch (error) {
    console.error(error);
    return res.status(500).json(createResponse("500", "Internal server error"));
  }
};

const chooseJuz = async (req, res) => {
  try {
    const connection = await getConnection();
    const { idGroup } = req.body;
    const userId = req.params.userId;
    const poraId = req.params.poraId;

    const insertQuery = `
      INSERT INTO bookedPoralar (poraId, idGroup, userId, isBooked)
      VALUES (?, ?, ?, true)
    `;
    await connection.query(insertQuery, [poraId, idGroup, userId]);

    const selectQuery = "SELECT name, image_url FROM user WHERE userId = ?";
    const [rows] = await connection.query(selectQuery, [userId]);

    if (rows.length === 0) {
      return res.status(404).json(createResponse("404", "User not found"));
    }

    return res.json(createResponse("200", "Success", rows[0]));
  } catch (err) {
    console.error(err);
    return res.status(500).json(createResponse("500", "Internal server error"));
  }
};

const finishedJuz = async (req, res) => {
  try {
    const connection = await getConnection();
    const { poraId, userId } = req.params;
    const idGroup = req.body.idGroup;

    const updateBookedPoralarQuery = `
      UPDATE bookedPoralar
      SET isDone = 1
      WHERE poraId = ? AND userId = ? AND idGroup = ?
    `;
    await connection.query(updateBookedPoralarQuery, [poraId, userId, idGroup]);

    const updateFinishedPoralarCountQuery = `
      UPDATE finishedPoralarCount
      SET juzCount = juzCount + 1
      WHERE idGroup = ?
    `;
    await connection.query(updateFinishedPoralarCountQuery, [idGroup]);

    return res.json(createResponse("200", `${poraId}-juz has been finished`, { poraId, userId }));
  } catch (error) {
    console.error(error);
    return res.status(500).json(createResponse("500", "Internal server error"));
  }
};

const cancelJuz = async (req, res) => {
  try {
    const connection = await getConnection();
    const { poraId, userId } = req.params;
    const idGroup = req.body.idGroup;

    const deleteQuery = `
      DELETE FROM bookedPoralar
      WHERE poraId = ? AND userId = ? AND idGroup = ?
    `;
    await connection.query(deleteQuery, [poraId, userId, idGroup]);

    return res.json(createResponse("200", `${poraId}-juz has been deleted`, { poraId, userId }));
  } catch (error) {
    console.error(error);
    return res.status(500).json(createResponse("500", "Internal server error"));
  }
};

const leaveGroup = async (req, res) => {
  try {
    const connection = await getConnection();
    const { userId, groupId } = req.body;

    // Remove userId from the usersId array in the Group table
    const groupQuery = `
      UPDATE \`Group\`
      SET usersId = JSON_REMOVE(usersId, JSON_UNQUOTE(JSON_SEARCH(usersId, 'one', ?)))
      WHERE idGroup = ? AND JSON_SEARCH(usersId, 'one', ?) IS NOT NULL
    `;
    const [groupResult] = await connection.query(groupQuery, [userId, groupId, userId]);
    if (groupResult.affectedRows === 0) {
      return res.status(404).json(createResponse("404", "Group not found or user is not part of the group"));
    }

    // Remove groupId from the groups array in the user table
    const userQuery = `
      UPDATE \`user\`
      SET \`groups\` = JSON_REMOVE(\`groups\`, JSON_UNQUOTE(JSON_SEARCH(\`groups\`, 'one', ?)))
      WHERE \`userId\` = ? AND JSON_SEARCH(\`groups\`, 'one', ?) IS NOT NULL
    `;
    const [userResult] = await connection.query(userQuery, [groupId, userId, groupId]);

    if (userResult.affectedRows === 0) {
      return res.status(404).json(createResponse("404", "User not found or not part of the group"));
    }

    return res.json(createResponse("200", "User has left the group", { userId, groupId }));
  } catch (error) {
    console.error(error);
    return res.status(500).json(createResponse("500", "Internal server error"));
  }
};

module.exports = {
  chooseJuz,
  createGroup,
  getAllGroups,
  getPublicGroups,
  getPrivateGroups,
  deleteGroup,
  findUser,
  inviteUser,
  getInvites,
  subscribeUser,
  finishedJuz,
  cancelJuz,
  showGroupProfile,
  showGroupSubs,
  leaveGroup
};
