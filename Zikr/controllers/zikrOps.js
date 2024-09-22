const { getConnection } = require("../../db/connectDb");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const newUser = async (req, res) => {
  try {
    const { name, surname, phone, mail, image_url, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10); // Hashing the password

    // Validate required fields
    if (!name || !surname || !phone || !mail || !password) { // Ensuring all necessary fields are provided
      return res.status(400).json(createResponse("400", "Missing required fields"));
    }

    const connection = await getConnection();

    try {
      // SQL query without the groups field, as it is no longer in your schema
      const query = `
        INSERT INTO user (phone, mail, name, surname, image_url, password)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
      const [result] = await connection.execute(query, [phone, mail, name, surname, image_url, hashedPassword]);

      const userId = result.insertId; // Getting the user ID from the inserted row

      // Generate JWT token after successful user creation
      const token = jwt.sign(
        { userId, phone, mail }, // Payload
        process.env.JWT_SECRET,  // JWT secret from environment variables
        { expiresIn: '1h' }      // Token expiration time
      );

      // Successful response with token
      return res.status(201).json({
        message: "User registered successfully",
        data: {
          userId,
          token,
          user: {
            name,
            surname,
            phone,
            mail,
            image_url
          }
        }
      });
    } catch (err) {
      console.error("Insert error:", err.message);
      return res.status(500).json(createResponse("500", "Database insertion failed"));
    }
  } catch (error) {
    console.error("Internal server error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const createZikrGoal = async (req, res) => {
  const { zikrId, groupId, goal } = req.body;
  const connection = await getConnection();

  if (!zikrId || !groupId || !goal) {
      return res.status(400).json({ error: "Missing required fields" });
  }

  try {
      const insertSql = "INSERT INTO zikr_goal (zikrId, groupId, goal) VALUES (?, ?, ?)";
      const [result] = await connection.execute(insertSql, [zikrId, groupId, goal]);

      if (result.insertId) {
          return res.status(201).json({ message: "Zikr goal created successfully", goalId: result.insertId });
      } else {
          return res.status(500).json({ error: "Failed to create Zikr goal" });
      }
  } catch (error) {
      console.error("Error creating Zikr goal:", error);
      return res.status(500).json({ error: "Internal server error" });
  }
};

const newZikr = async (req, res) => {
  try {
    const { name, desc, body, sound_url } = req.body;
    const connection = await getConnection();

    if (!name) {
      return res.status(400).send("no_c");
    }

    const insertSql =
      "INSERT INTO `zikr` (name, `desc`, body, sound_url) VALUES (?, ?, ?, ?)";

    // Insert new zikr
    const [result] = await connection.query(insertSql, [name, desc, body, sound_url]);

    if (result.affectedRows > 0) {
      return res.status(200).send("ok");
    } else {
      return res.status(500).json({ status: "500", message: "Insert failed" });
    }
  } catch (error) {
    console.error("Error occurred:", error); // For debugging
    return res.status(500).json({ error: "Internal server error" }); 
  }
};


const fetchGroups = async (req, res) => {
  const { ownerId, groupType } = req.query;
  const connection = await getConnection();

  if (!ownerId) {
    return res.status(400).json({ error: "Owner ID is required" });
  }

  try {
    const selectSql = `
      SELECT * FROM \`Group\`
      WHERE adminId = ? AND groupType = ?
    `;
    const [groups] = await connection.execute(selectSql, [ownerId, groupType]);

    if (groups.length > 0) {
      return res.status(200).json({ message: "Groups fetched successfully", groups });
    } else {
      return res.status(404).json({ error: "No groups found" });
    }
  } catch (error) {
    console.error("Fetch groups error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};



const insertNewGroup = async (req, res) => {
  const { ownerId, name, groupType, isPublic, image_url, hatmSoni } = req.body;
  const connection = await getConnection();

  if (!ownerId || !name || !groupType) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const insertSql = `
      INSERT INTO \`Group\` (name, adminId, groupType, isPublic, guruhImg, hatmSoni)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const [result] = await connection.execute(insertSql, [name, ownerId, groupType, isPublic, image_url, hatmSoni]);

    if (result.insertId) {
      return res.status(201).json({ message: "Group created successfully", groupId: result.insertId });
    } else {
      return res.status(500).json({ error: "Failed to create group" });
    }
  } catch (error) {
    console.error("Error inserting new group:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const addZikrCountForPrivate = async (req, res) => {
  const { zikr_goal_id, userId, count } = req.body;
  const sessionDate = new Date();
  const connection = await getConnection();

  try {
      const insertSql = "INSERT INTO ZikrCounts (zikr_goal_id, userId, count, sessionDate) VALUES (?, ?, ?, ?)";
      const [result] = await connection.execute(insertSql, [zikr_goal_id, userId, count, sessionDate]);

      if (result.insertId) {
          return res.status(201).json({ message: "Zikr count added successfully", countId: result.insertId });
      } else {
          return res.status(500).json({ error: "Failed to add Zikr count" });
      }
  } catch (error) {
      console.error("Error adding Zikr count:", error);
      return res.status(500).json({ error: "Internal server error" });
  }
};

const addZikrCountForGroup = async (req, res) => {
  const { groupId, zikrId, count } = req.body;
  const userId = req.user.id; // User ID from authenticated session
  console.log(userId);
  console.log(groupId);
  console.log(count);
  

  if (!groupId || !zikrId || !count) {
    return res.status(400).json({ message: "Missing required parameters" });
  }
  try {
    const connection = await getConnection();

    // Retrieve the current goal for the zikr in the group
    const [zikrGoal] = await connection.query(
      "SELECT goal FROM zikr_goal WHERE groupId = ? AND zikrId = ?",
      [groupId, zikrId]
    );

    if (zikrGoal.length === 0) {
      return res.status(404).json({ message: "No goal found for this Zikr in the specified group" });
    }

    const goal = zikrGoal[0].goal;

    // Update the zikr count for the group
    const query = `
      INSERT INTO group_zikr_activities (group_id, zikr_id, zikr_count)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE zikr_count = zikr_count + VALUES(zikr_count);
    `; // Assumes 'group_id' and 'zikr_id' as a composite primary key

    const [result] = await connection.query(query, [groupId, zikrId, count]);

    if (result.affectedRows > 0) {
      // Check the new total count
      const [updatedCountResult] = await connection.query(
        "SELECT zikr_count FROM group_zikr_activities WHERE group_id = ? AND zikr_id = ?",
        [groupId, zikrId]
      );

      const totalCount = updatedCountResult[0].zikr_count;

      // If total count has reached or exceeded the goal, notify or perform an action
      if (totalCount >= goal) {
        // Action when the goal is met (e.g., send notification, update goal status, etc.)
        return res.status(200).json({
          message: "Zikr count updated and goal reached!",
          totalCount,
          goalReached: true,
        });
      }

      // Otherwise, return the updated count without goal reached status
      return res.status(200).json({
        message: "Zikr count updated successfully",
        totalCount,
        goalReached: false,
      });
    } else {
      return res.status(500).json({ message: "Failed to update zikr count" });
    }
  } catch (error) {
    console.error("Database error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};




module.exports = { 
  newUser,
  createZikrGoal,
  newZikr,
  fetchGroups,
  insertNewGroup,
  addZikrCountForGroup };

function createResponse(status, message, data = null) {
  return {
    status,
    message,
    data,
  };
}
