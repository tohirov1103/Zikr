const { getConnection } = require("../db/connectDb");

// Helper function for consistent response creation
function createResponse(status, message, data = null) {
  return { status, message, data };
}

// Example validation (can be expanded for all functions)
const validateCreateGroup = ({ name, isPublic, kimga, guruhImg }) => {
  return name && isPublic !== undefined && kimga && guruhImg;
};

const createGroup = async (req, res) => {
  const { name, isPublic, kimga, guruhImg, hatmSoni } = req.body;
  const adminId = req.params.adminId;
  console.log(adminId);

  if (!adminId) {
    return res.status(400).json(createResponse("400", "Admin ID is required"));
  }

  if (!validateCreateGroup(req.body)) {
    return res.status(400).json(createResponse("400", "Invalid input data"));
  }

  try {
    const connection = await getConnection();
    // Start transaction to ensure atomicity
    await connection.beginTransaction();

    const insertGroupQuery = `
      INSERT INTO \`Group\` (name, adminId, isPublic, guruhImg, kimga, hatmSoni)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [groupResult] = await connection.query(insertGroupQuery, [name, adminId, isPublic, guruhImg, kimga, hatmSoni]);

    if (groupResult.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json(createResponse("404", "Group not created"));
    }

    // Automatically add the creator as an admin in the group_members table
    const insertMemberQuery = `
      INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, 'admin')
    `;
    await connection.query(insertMemberQuery, [groupResult.insertId, adminId]);

    // Initialize the finishedPoralarCount for the new group
    const insertFinishedCountQuery = `
      INSERT INTO finishedPoralarCount (idGroup, juzCount)
      VALUES (?, 0)
    `;
    await connection.query(insertFinishedCountQuery, [groupResult.insertId]);

    // Commit the transaction
    await connection.commit();

    return res.json(createResponse("200", "Group has been created", { groupId: groupResult.insertId }));
  } catch (err) {
    console.error("Error creating group:", err);
    return res.status(500).json(createResponse("500", "Internal server error"));
  }
};


const updateGroup = async (req, res) => {
  const { name, isPublic, guruhImg, kimga, hatmSoni } = req.body;
  const groupId = req.params.id;

  if (!groupId || !name || isPublic === undefined || !guruhImg || !kimga || !hatmSoni) {
    return res.status(400).json(createResponse("400", "Invalid input data"));
  }

  try {
    const connection = await getConnection();
    const updateGroupQuery = `
      UPDATE Group
      SET name = ?, isPublic = ?, guruhImg = ?, kimga = ?, hatmSoni = ?
      WHERE idGroup = ?
    `;
    const [result] = await connection.query(updateGroupQuery, [name, isPublic, guruhImg, kimga, hatmSoni, groupId]);

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
    const userId = req.user.id;

    console.log('User ID:', userId);
    console.log('Is Public:', isPublic);

    // Updated query to join Group with group_members table
    const query = `
      SELECT g.*
      FROM \`Group\` g
      INNER JOIN group_members gm ON g.idGroup = gm.group_id
      WHERE gm.user_id = ? AND g.isPublic = ?
    `;

    const [groups] = await connection.query(query, [userId, isPublic]);


    // Check if groups exist before responding
    if (!groups || groups.length === 0) {
      return res.status(404).json(createResponse("404", "No groups found"));
    }

    console.log('Groups:', groups);

    return res.json(createResponse("200", "Success", groups));
  } catch (err) {
    console.error(err);
    return res.status(500).json(createResponse("500", "Internal server error"));
  }
};


const getAllGroups = async (req, res) => {
  try {
    const connection = await getConnection();
    const { userId } = req.query; // User ID passed as a parameter to filter groups

    // Optional: Get groupType from query to filter specific types
    const groupType = req.query.groupType; // 'quran' or 'zikr'

    let query = `
      SELECT g.*
      FROM \`Group\` g
      INNER JOIN group_members gm ON g.idGroup = gm.group_id
      WHERE gm.user_id = ?
    `;

    const queryParams = [userId];

    // Filter by groupType if provided
    if (groupType) {
      query += ` AND g.groupType = ?`;
      queryParams.push(groupType);
    }

    // Sort by groupType enum
    query += ` ORDER BY FIELD(g.groupType, 'quran', 'zikr')`;

    const [groups] = await connection.query(query, queryParams);

    if (groups.length === 0) {
      return res.status(404).json(createResponse("404", "No groups found"));
    }

    return res.json(createResponse("200", "Success", groups));
  } catch (err) {
    console.error("Error retrieving groups:", err);
    return res.status(500).json(createResponse("500", "Internal server error"));
  }
};



const getPublicGroups = (req, res) => {
  return getGroups(req, res, true);  // true for public groups
};

const getPrivateGroups = (req, res) => {
  return getGroups(req, res, false);  // false for private groups
};


const showGroupDetails = async (req, res) => {
  try {
    const connection = await getConnection();
    const groupId = req.params.id;

    // Step 1: Fetch the group profile information
    const groupProfileQuery = "SELECT name, kimga, hatmSoni FROM `Group` WHERE idGroup = ?";
    const [groupProfile] = await connection.query(groupProfileQuery, [groupId]);

    if (groupProfile.length === 0) {
      return res.status(404).json(createResponse("404", "Group not found"));
    }

    // Step 2: Fetch the group subscribers (members) from group_members table
    const subscribersQuery = `
      SELECT u.name, u.surname, u.phone
      FROM group_members gm
      INNER JOIN user u ON gm.user_id = u.userId
      WHERE gm.group_id = ?
    `;
    const [subscribers] = await connection.query(subscribersQuery, [groupId]);

    // Combine both group profile and subscriber information in the response
    const response = {
      groupProfile: groupProfile[0],
      subscribers: subscribers
    };

    return res.json(createResponse("200", "Success", response));
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
    const {phone} = req.query;
    
    console.log("Phone number received:", phone);
    const query = "SELECT * FROM `user` WHERE phone = ?";
    const [user] = await connection.query(query, [phone]);

    console.log("Executing query:", query, phone);
    if (user.length == 0) {
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
    const receiverId = req.params.id;  // The user to be invited
    const senderId = req.user.id;  // The admin or sender of the invite
    const { groupId, isInvite } = req.body;

    // Step 1: Check if the user is already in the group
    const checkQuery = "SELECT * FROM group_members WHERE user_id = ? AND group_id = ?";
    const [checkResult] = await connection.query(checkQuery, [receiverId, groupId]);

    if (checkResult.length > 0) {
      // If the user is already in the group
      return res.status(400).json(createResponse("400", "User is already in the group"));
    }

    // Step 2: Insert an invitation into the notifications table
    const insertQuery = "INSERT INTO notifications (senderId, receiverId, groupId, isInvite) VALUES (?, ?, ?, ?)";
    await connection.query(insertQuery, [senderId, receiverId, groupId, isInvite]);

    // Step 3: Optionally, if `isInvite` is true, add the user directly to the group_members table
    if (isInvite) {
      const addMemberQuery = "INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, 'member')";
      await connection.query(addMemberQuery, [groupId, receiverId]);
    }

    // Step 4: Return success response
    return res.status(200).json(createResponse("200", "Invitation sent successfully", { groupId, receiverId }));
  } catch (error) {
    console.error("Error inviting user:", error);
    return res.status(500).json(createResponse("500", "Internal server error"));
  }
};


const subscribeUser = async (req, res) => {
  try {
    const connection = await getConnection();
    const { userId, groupId } = req.body;

    // Check if already subscribed
    const checkQuery = "SELECT * FROM group_members WHERE user_id = ? AND group_id = ?";
    const [exists] = await connection.query(checkQuery, [userId, groupId]);
    if (exists.length > 0) {
      return res.status(400).json(createResponse("400", "User already subscribed to the group"));
    }

    // Subscribe user to group
    const subscribeQuery = "INSERT INTO group_members (group_id, user_id, role) VALUES (?, ?, 'member')";
    await connection.query(subscribeQuery, [groupId, userId]);

    return res.json(createResponse("200", "User subscribed to the group", { userId, groupId }));
  } catch (error) {
    console.error(error);
    return res.status(500).json(createResponse("500", "Internal server error"));
  }
};


const getInvites = async (req, res) => {
  try {
    const connection = await getConnection();
    const userId = req.user.id; // The user who receives invites

    // Fetch all invites where the user is the receiver
    const query = `
      SELECT n.*, g.name as groupName, u.name as senderName
      FROM notifications n
      JOIN \`Group\` g ON n.groupId = g.idGroup
      JOIN user u ON n.senderId = u.userId
      WHERE n.isInvite = true AND n.receiverId = ?;
    `;

    const [invites] = await connection.query(query, [userId]);

    // If invites are found, return them
    return res.status(200).json(createResponse("200", "Success", invites));
  } catch (error) {
    console.error("Error fetching invites:", error);
    return res.status(500).json(createResponse("500", "Internal server error"));
  }
};


const chooseJuz = async (req, res) => {
  try {
    const connection = await getConnection();
    const { idGroup } = req.body;
    const userId = req.params.userId;
    const poraId = req.params.poraId;

    // Start a transaction
    await connection.beginTransaction();

    // Check if the Juz is already booked
    const checkQuery = `
      SELECT * FROM bookedPoralar 
      WHERE poraId = ? AND idGroup = ? AND isBooked = true;
    `;
    const [alreadyBooked] = await connection.query(checkQuery, [poraId, idGroup]);

    if (alreadyBooked.length > 0) {
      // If the Juz is already booked, roll back and return an error
      await connection.rollback();
      return res.status(409).json({ message: "This Juz is already booked" });
    }

    // If not booked, proceed to book the Juz
    const insertQuery = `
      INSERT INTO bookedPoralar (poraId, idGroup, userId, isBooked)
      VALUES (?, ?, ?, true)
    `;
    await connection.query(insertQuery, [poraId, idGroup, userId]);

    // Commit the transaction
    await connection.commit();

    // Retrieve user details for the response
    const selectQuery = "SELECT name, image_url FROM user WHERE userId = ?";
    const [rows] = await connection.query(selectQuery, [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ message: "Juz successfully booked", userDetails: rows[0] });
  } catch (err) {
    let connection = await getConnection();
    // If any error occurs, roll back the transaction
    await connection.rollback();
    console.error("Error booking Juz:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};


const finishedJuz = async (req, res) => {
  try {
    const connection = await getConnection();
    const poraId = req.params.poraId;  
    const userId = req.params.userId;
    const idGroup = req.body.idGroup;

    // Start a transaction to ensure both operations either complete successfully or rollback
    await connection.beginTransaction();

    // Update the booking to mark it as done
    const updateBookedPoralarQuery = `
      UPDATE bookedPoralar
      SET isDone = 1
      WHERE poraId = ? AND userId = ? AND idGroup = ? AND isBooked = 1
    `;
    const [updateResult] = await connection.query(updateBookedPoralarQuery, [poraId, userId, idGroup]);

    // Check if the update actually updated any rows
    if (updateResult.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json(createResponse("404", `No active booking found for ${poraId}-juz with user ID ${userId} in group ID ${idGroup}`));
    }

    // Update the count of finished Juz in the group
    const updateFinishedPoralarCountQuery = `
      UPDATE finishedPoralarCount
      SET juzCount = juzCount + 1
      WHERE idGroup = ?
    `;
    await connection.query(updateFinishedPoralarCountQuery, [idGroup]);

    // Fetch the goal from the zikr_goal table (where zikr_id is NULL for Quran)
    const getGoalQuery = `
      SELECT goal 
      FROM zikr_goal
      WHERE group_id = ? AND zikr_id IS NULL
    `;
    const [goalResult] = await connection.query(getGoalQuery, [idGroup]);

    if (goalResult.length === 0) {
      await connection.rollback();
      return res.status(404).json(createResponse("404", "No Quran goal found for this group"));
    }

    const quranGoal = goalResult[0].goal;

    // Check the current `juzCount`
    const checkFinishedQuery = `
      SELECT f.juzCount
      FROM finishedPoralarCount f
      WHERE f.idGroup = ?
    `;
    const [countResult] = await connection.query(checkFinishedQuery, [idGroup]);

    if (countResult.length === 0) {
      await connection.rollback();
      return res.status(404).json(createResponse("404", "Finished count not found"));
    }

    const { juzCount } = countResult[0];

    // If the current count reaches the goal (e.g., 30 Juz for Quran), mark the goal as reached
    if (juzCount >= quranGoal) {
      // Reset the count and update the hatm completion
      const resetFinishedPoralarCountQuery = `
        UPDATE finishedPoralarCount
        SET juzCount = 0
        WHERE idGroup = ?
      `;
      await connection.query(resetFinishedPoralarCountQuery, [idGroup]);

      // Increment hatmSoni in the group table (representing completed hatms)
      const incrementHatmQuery = `
        UPDATE \`Group\`
        SET hatmSoni = hatmSoni + 1
        WHERE idGroup = ?
      `;
      await connection.query(incrementHatmQuery, [idGroup]);

      // Commit the transaction
      await connection.commit();

      return res.json(createResponse("200", `${poraId}-juz has been finished. Full hatm completed!`, { poraId, userId, hatmCompleted: true }));
    }

    // Commit the transaction if all is well
    await connection.commit();

    // If the full hatm is not completed, return normal response
    return res.json(createResponse("200", `${poraId}-juz has been finished`, { poraId, userId, hatmCompleted: false }));
  } catch (error) {
    let connection = await getConnection();
    // If any error occurs, rollback the transaction
    await connection.rollback();
    console.error("Error finishing Juz:", error);
    return res.status(500).json(createResponse("500", "Internal server error"));
  }
};


const cancelJuz = async (req, res) => {
  try {
    const connection = await getConnection();
    const { poraId, userId } = req.params;  // Ensure that these params are properly passed in the request.
    const idGroup = req.body.idGroup;  // Ensure that idGroup is passed in the request body.

    // Start a transaction
    await connection.beginTransaction();

    const deleteQuery = `
      DELETE FROM bookedPoralar
      WHERE poraId = ? AND userId = ? AND idGroup = ?
    `;
    const [result] = await connection.query(deleteQuery, [poraId, userId, idGroup]);

    // Check if the delete operation actually deleted anything
    if (result.affectedRows === 0) {
      // If nothing was deleted, rollback and inform the user
      await connection.rollback();
      return res.status(404).json(createResponse("404", `No booking found for ${poraId}-juz with user ID ${userId} in group ID ${idGroup}`, { poraId, userId }));
    }

    // Commit the transaction
    await connection.commit();

    return res.json(createResponse("200", `${poraId}-juz has been deleted`, { poraId, userId }));
  } catch (error) {
    let connection = await getConnection();
    // If any error occurs, roll back the transaction
    await connection.rollback();
    console.error("Error cancelling booking:", error);
    return res.status(500).json(createResponse("500", "Internal server error"));
  }
};


const leaveGroup = async (req, res) => {
  try {
    const connection = await getConnection();
    const { userId, groupId } = req.body;

    // Remove the user from the group_members table
    const deleteQuery = `
      DELETE FROM group_members
      WHERE user_id = ? AND group_id = ?
    `;
    const [result] = await connection.query(deleteQuery, [userId, groupId]);

    if (result.affectedRows === 0) {
      return res.status(404).json(createResponse("404", "User not found in the group or group does not exist"));
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
  getGroups,
  getPublicGroups,
  getPrivateGroups,
  deleteGroup,
  findUser,
  inviteUser,
  getInvites,
  subscribeUser,
  finishedJuz,
  cancelJuz,
  showGroupDetails,
  leaveGroup
};
