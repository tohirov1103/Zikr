const { getConnection } = require("../../db/connectDb");


const newUser = async (req, res) => {
  try {
    const { name, surname, phone, mail, image_url } = req.body;
    const groups = "[]"; // Default empty JSON array for groups

    // Validate required fields
    if (!name || !(phone || mail)) {
      return res.status(422).json(createResponse("422", "Unprocessable content"));
    }

    const connection = await getConnection();

    try {
      // Use a parameterized query to avoid SQL injection
      const query = "INSERT INTO user (phone, mail, name, surname, image_url, `groups`) VALUES (?, ?, ?, ?, ?, ?)";
      const [result] = await connection.execute(query, [phone, mail, name, surname, image_url, groups]);

      const userId = result.insertId;
      return res.status(200).json(createResponse("200", "ok", { userId }));
    } catch (err) {
      console.error("Insert error:", err.message);
      return res.status(500).json(createResponse("500", "Insert failed"));
    }
  } catch (error) {
    console.error("Internal server error:", error);
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


const fetchGroupsByOwnerId = async (req, res) => {
  try {
    const ownerId = req.query.ownerId;
    const connection = await getConnection();

    if (!ownerId) {
      return res
        .status(422)
        .json(createResponse("422", "Unprocessable content"));
    }

    const selectSql = "SELECT * FROM `ZikrGroup` WHERE ownerId = ?";

    // Fetch groups by ownerId
    const [results] = await connection.query(selectSql, [ownerId]);

    if (results.length > 0) {
      const listGroups = results.map((row) => ({
        groupId: row.groupId,
        name: row.name,
        followers: row.followers,
        purpose: row.purpose,
        total_count: row.total_count,
        image_url: row.image_url,
        isPublic: row.isPublic,
        created_time: row.created_time,
      }));

      return res.status(200).json(createResponse("200", "ok", listGroups));
    } else {
      return res.status(404).json(createResponse("404", "No groups found"));
    }
  } catch (error) {
    console.error("Error occurred:", error); // For debugging
    return res.status(500).json({ error: "Internal server error" });
  }
};


const insertNewGroup = async (req, res) => {
  try {
    const { ownerId, name, purpose, comment, image_url, isPublic } = req.body;
    const connection = await getConnection();
    
    if (!ownerId || !isPublic || !purpose) {
      return res
        .status(422)
        .json(createResponse("422", "Unprocessable content"));
    }

    const insertSql =
      "INSERT INTO `ZikrGroup` (ownerId, name, followers, purpose, total_count, isPublic, image_url) VALUES (?, ?, ?, ?, 0, ?, ?)";

    // Insert new group
    const [result] = await connection.query(insertSql, [
      ownerId,
      name,
      "[]", // Assuming this is a JSON string to represent an empty array
      purpose,
      isPublic,
      image_url,
    ]);

    const groupId = result.insertId;

    // Fetch the newly created group
    const fetchSql = "SELECT * FROM `ZikrGroup` WHERE groupId = ?";
    const [rows] = await connection.query(fetchSql, [groupId]);

    if (rows.length > 0) {
      return res.status(200).json(createResponse("200", "ok", rows[0]));
    } else {
      return res.status(404).json(createResponse("404", "Group not found"));
    }
  } catch (error) {
    console.error("Error occurred:", error); // For debugging
    return res.status(500).json(createResponse("500", "Server error"));
  }
};


const updateGroupTotalCount = async (req, res) => {
  try {
    const connection = await getConnection();
    const { userId, groupId, count } = req.body;

    if (!userId || !groupId || !count) {
      return res
        .status(422)
        .json(createResponse("422", "Unprocessable content"));
    }

    const updateSql =
      "UPDATE `ZikrGroup` SET total_count = total_count + ? WHERE groupId = ?";

    // Update the total_count in the ZikrGroup table
    const [result] = await connection.query(updateSql, [count, groupId]);

    if (result.affectedRows > 0) {
      const fetchSql = "SELECT total_count FROM `ZikrGroup` WHERE groupId = ?";
      const [rows] = await connection.query(fetchSql, [groupId]);

      if (rows.length > 0) {
        return res.status(200).json(createResponse("200", "ok", rows[0]));
      } else {
        return res
          .status(404)
          .json(createResponse("404", "Group not found"));
      }
    } else {
      return res.status(404).json(createResponse("404", "Group not found"));
    }
  } catch (error) {
    console.error("Error occurred:", error); // For debugging
    return res.status(500).json({ error: "Internal server error" });
  }
};


module.exports = { newUser, newZikr, fetchGroupsByOwnerId, insertNewGroup,updateGroupTotalCount };

function createResponse(status, message, data = null) {
  return {
    status,
    message,
    data,
  };
}
