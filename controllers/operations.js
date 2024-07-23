const { Hatm } = require("../models/index");
const { getConnection } = require("../db/connectDb");
const { response } = require("express");
const poralar = require("../functions/pora");
const { get } = require("../routes/tasks");
// console.log(poralar);
const getHatm = async (req, res) => {
  try {
    const hatm = await Hatm.findAll();
    if (!hatm) {
      res.json("Hatm not found");
    }
    res.json(hatm);
  } catch (error) {
    console.log(error);
  }
};
const chooseHatm = async (req, res) => {
  try {
    const connection = await getConnection();
    const userId = req.body.userId;
    const poraId = req.body.poraId;
    const idGroup = req.body.idGroup;
    const isBooked = true;

    await connection.connect(function (err) {
      const query =
        " INSERT INTO bookedPoralar (poraId, idGroup, userId,isBooked) VALUES (?, ?, ?, true)";
      connection.query(
        query,
        [userId, idGroup, poraId, isBooked],
        (err, result) => {
          if (err) {
            console.log(err);
            return res.status(500).json({ error: "Internal server error" });
          }
          const query = `SELECT name,image_url FROM user WHERE userId = ${userId}`;
          connection.query(query, (err, result) => {
            if (err) {
              console.error(err);
              return res.status(500).json({ error: "Internal server error" });
            }
            if (result.length === 0) {
              return res.status(404).json({ error: "User not found" });
            }
            const user = result[0];
            res.json(user);
            // res.json(user);
          });
        }
      );
    });

    // await connection.connect(function (err) {

    // });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
};
const createGroup = async (req, res) => {
  const adminId = req.params.id;
  const name = req.body.name;
  const numOfUsers = req.body.numOfUsers;
  const usersId = req.body.usersId;
  const status = req.body.status;

  const connection = await getConnection();
  await connection.connect(function (err) {
    const query = `INSERT INTO \`Group\` (name, adminId, numOfUsers, usersId, status) VALUES (?, ?, ?, ?, ?)`;
    connection.query(
      query,
      [name, adminId, numOfUsers, usersId, status],
      async (err, result) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: "Internal server error" });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ error: "User not found" });
        }

        // Get the inserted group's id
        const insertedGroupId = result.insertId;

        // Insert the group id into the finishedPoralarCount table
        const insertFinishedPoralarCountQuery = `INSERT INTO finishedPoralarCount (idGroup) VALUES (?)`;
        connection.query(
          insertFinishedPoralarCountQuery,
          [insertedGroupId],
          (err, result) => {
            if (err) {
              console.error(err);
              return res.status(500).json({ error: "Internal server error" });
            }

            res.json({ message: "Group has been created" });
          }
        );
      }
    );
  });
};
const getAllGroups = async (req, res) => {
  const connection = await getConnection();
  await connection.connect(function (err) {
    const query = "SELECT * FROM `Group` ";
    connection.query(query, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal server error" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(result);
    });
  });
};
const getPublicGroups = async (req, res) => {
  const userId = req.params.id;
  const connection = await getConnection();
  await connection.connect(function (err) {
    const query = `SELECT * FROM \`Group\` WHERE JSON_CONTAINS(usersId, '${userId}', '$') AND status = 'public';`;
    connection.query(query, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal server error" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(result);
    });
  });
};
const getPrivateGroups = async (req, res) => {
  const userId = req.params.id;
  const connection = await getConnection();
  await connection.connect(function (err) {
    const query = `SELECT * FROM \`Group\` WHERE JSON_CONTAINS(usersId, '${userId}', '$') AND status = 'private';`;
    connection.query(query, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal server error" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(result);
    });
  });
};
const findUser = async (req, res) => {
  const connection = await getConnection();
  await connection.connect(function (err) {
    const findUserId = req.body.findUserId;
    const query = `SELECT * FORM \`user\` WHERE phonenumber = ${findUserId}`;
    connection.query(query, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ error: "Internal server error" });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(result);
    });
  });
};
const inviteUser = async (req, res) => {
  try {
    const connection = await getConnection();
    await connection.connect(function (err) {
      const receiverId = req.params.id;
      const { senderId, groupId, isInvite, isRead } = req.body;
      const query =
        "INSERT INTO notifications (senderId, receiverId, body, isInvite, isRead) VALUES (?,?,?,?,?)";
      connection.query(
        query,
        [senderId, receiverId, groupId, isInvite, isRead],
        (err, result) => {
          if (err) {
            console.log(err);
            return res.status(500).json({ error: "Internal server error" });
          }
          res.json({ message: "Invitation sent", groupId, receiverId });
        }
      );
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
const getInvites = async (req, res) => {
  try {
    const connection = getConnection();
    await connection.connect(function (err) {
      const getInviteOnly = "SELECT * FROM notifications WHERE isInvite = true";
      connection.query(getInviteOnly, (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: "Internal server error" });
        }
        res.json(result);
      });
    });
  } catch (error) {
    console.log(error);
  }
};
const subscribeUser = async (req, res) => {
  try {
    const connection = await getConnection();
    await connection.connect(function (err) {
      const { userId, groupId } = req.body;

      // 1. Update the `Group` table
      const groupQuery = `INSERT INTO \`Group\` (usersId, idGroup) 
         VALUES (CAST(JSON_ARRAY_APPEND(usersId, '$', ${userId}) AS JSON), ${groupId})
         ON DUPLICATE KEY UPDATE usersId = CAST(JSON_ARRAY_APPEND(usersId, '$', ${userId}) AS JSON)`;
      connection.query(groupQuery, (err, groupResult) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: "Internal server error" });
        }

        // 2. Update the `user` table
        const userQuery = `UPDATE \`user\` SET \`groups\` = CAST(JSON_ARRAY_APPEND(\`groups\`, '$', ${groupId}) AS JSON) WHERE \`userId\` = ${userId}`;
        connection.query(userQuery, (err, userResult) => {
          if (err) {
            console.log(err);
            return res.status(500).json({ error: "Internal server error" });
          }
          res.json({ message: "User subscribed to group" });
        });
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
const finishedJuz = async (req, res) => {
  try {
    const connection = await getConnection();
    const { poraId, userId } = req.params;
    const idGroup = req.body.idGroup;
    await connection.connect(function (err) {
      // 1
      const query = `UPDATE bookedPoralar SET isDone = 1 WHERE poraId = ${poraId} AND userId = ${userId} AND idGroup = ${idGroup}`;
      connection.query(query, (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: "Internal server error" });
        }
        res.json({ message: `${poraId}-juz has been finished ` });

        // 2
        const query2 = `UPDATE finishedPoralarCount SET juzCount = juzCount + 1 WHERE idGroup = ${idGroup};`;
        connection.query(query2, (err, result) => {
          if (err) {
            console.log(err);
            return res.status(500).json({ error: "Internal server error" });
          }
        });
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
const cancelJuz = async (req, res) => {
  try {
    const connection = await getConnection();
    const { poraId, userId } = req.params;
    const idGroup = req.body.idGroup;
    await connection.connect(function (err) {
      const query = `DELETE FROM bookedPoralar WHERE poraId = ${poraId} AND userId = ${userId} AND idGroup = ${idGroup}`;
      connection.query(query, (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).json({ error: "Internal server error" });
        }
        res.json({ message: `${poraId}-juz has been deleted ` });
      });
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
const showGroupProfile = async (req, res) => {
  try {
    const connection = await getConnection();
    const groupId = req.params.id;
    await connection.connect(function (err) {
      const query = `SELECT name,kimga,hatmSoni FROM \`Group\` WHERE idGroup = ${groupId}`;
      connection.query(query, (err, result) => {
        if (err) {
          console.log(err);
          res.status(500).json({ error: "Internal Server Error" });
        }
        res.json(result);
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
const showGroupSubs = async (req, res) => {
  try {
    const connection = await getConnection();
    const idGroup = req.params.id;
    await connection.connect(function (err) {
      if (err) {
        console.log(err);
      }
      const query = `SELECT usersId FROM \`Group\` WHERE idGroup = ${idGroup}`;
      connection.query(query, (err, result) => {
        if (err) {
          console.log(err);
          res.status(500).json({ error: "Internal Server Error" });
        }
        const usersId = result;
        const idsString = `${usersId[0].usersId.replace(/[\[\]']+/g, '').split(',').map(Number).filter((v, i, arr) => arr.indexOf(v) === i).join(',')}`;
        console.log(idsString);
        const query2 = `SELECT name, surname, phone FROM user WHERE find_in_set(userId,'${idsString}')`
        connection.query(query2,(err,result)=>{
          if (err) {
            console.log(err);
            res.status(500).json({ error: "Internal Server Error" });
          }
          res.json(result)
        })
      });
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
 
module.exports = {
  getHatm,
  chooseHatm,
  createGroup,
  getAllGroups,
  getPublicGroups,
  getPrivateGroups,
  findUser,
  inviteUser,
  getInvites,
  subscribeUser,
  finishedJuz,
  cancelJuz,
  showGroupProfile,
  showGroupSubs
};

// boshladim tugatdim
