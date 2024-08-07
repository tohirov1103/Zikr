const { getConnection } = require("../../db/connectDb");

const newUser = async (req, res) => {
  try {
    const { name, surname, phone, mail, image_url } = req.body;

    if (!name || !(phone || mail)) {
      return res
        .status(422)
        .json(createResponse("422", "Unprocessable content"));
    }
    const connection = await getConnection();
    await connection.connect(function (err) {
      const query =
        "INSERT INTO user (phone, mail, name, surname, image_url) VALUES (?, ?, ?, ?, ?)";
      connection.query(
        query,
        [phone, mail, name, surname, image_url],
        (err, result) => {
          if (err) {
            return res.status(500).json(createResponse("500", "Insert failed"));
          }

          const userId = result.insertId;
          return res.status(200).json(createResponse("200", "ok", { userId }));
        }
      );
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
  }
};

const newZikr = async (req, res) => {
  try {
    const { name, desc, body, sound_url } = req.body;
    const connection = await getConnection();
    if (name) {
      await connection.connect(function (err) {
        const insertSql =
          "INSERT INTO `zikr` (name, `desc`, body, sound_url) VALUES (?, ?, ?, ?)";
        conn.query(insertSql, [name, desc, body, sound_url], (err, result) => {
          if (err) {
            return res
              .status(500)
              .json({ status: "500", message: "Insert failed" });
          }
          return res.status(200).send("ok");
        });
      });
    } else {
      return res.status(400).send("no_c");
    }
  } catch (error) {
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

    await connection.connect(function (err) {
      const selectSql = "SELECT * FROM `group` WHERE ownerId = ?";
      connection.query(selectSql, [ownerId], (err, results) => {
        if (err) {
          return res
            .status(500)
            .json(createResponse("500", "Query preparation failed"));
        }

        if (results.length > 0) {
          const listGroups = results.map((row) => ({
            groupId: row.groupId,
            name: row.name,
            fallowers: row.fallowers,
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
      });
    });
  } catch (error) {
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

    await connection.connect(function (err) {
      const insertSql =
        "INSERT INTO `group` (ownerId, name, fallowers, purpose, total_count, isPublic, image_url) VALUES (?, ?, ?, ?, 0, ?, ?)";
      conn.query(
        insertSql,
        [ownerId, name, "{}", purpose, isPublic, image_url],
        (err, result) => {
          if (err) {
            return res.status(500).json(createResponse("500", "Insert failed"));
          }

          const groupId = result.insertId;
          const fetchSql = "SELECT * FROM `group` WHERE groupId = ?";
          conn.query(fetchSql, [groupId], (err, rows) => {
            if (err) {
              return res
                .status(500)
                .json(createResponse("500", "Fetch failed"));
            }

            if (rows.length > 0) {
              return res.status(200).json(createResponse("200", "ok", rows[0]));
            } else {
              return res
                .status(404)
                .json(createResponse("404", "Group not found"));
            }
          });
        }
      );
    });
  } catch (error) {
    return res.status(500).json({ error: "Internal server error" });
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
    await connection.connect(function (err) {
      const updateSql =
        "UPDATE `group` SET total_count = total_count + ? WHERE groupId = ?";
      conn.query(updateSql, [count, groupId], (err, result) => {
        if (err) {
          return res.status(500).json(createResponse("500", "Update failed"));
        }

        if (result.affectedRows > 0) {
          const fetchSql = "SELECT total_count FROM `group` WHERE groupId = ?";
          conn.query(fetchSql, [groupId], (err, rows) => {
            if (err) {
              return res
                .status(500)
                .json(createResponse("500", "Fetch failed"));
            }

            if (rows.length > 0) {
              return res.status(200).json(createResponse("200", "ok", rows[0]));
            } else {
              return res
                .status(404)
                .json(createResponse("404", "Group not found"));
            }
          });
        } else {
          return res.status(404).json(createResponse("404", "Group not found"));
        }
      });
    });
  } catch (error) {
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
