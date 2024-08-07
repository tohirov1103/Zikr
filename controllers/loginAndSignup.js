const jwt = require('jsonwebtoken');
const { getConnection } = require("../db/connectDb");
const bcrypt = require("bcrypt");
const { jwtTokens } = require("../utils/jwt-helper");

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const connection = await getConnection();
    await connection.connect();
    const query = 'SELECT * FROM "Users" WHERE email = $1';
    const user = await connection.query(query, [email]);
    if (user.rows.length === 0)
      return res.status(401).json({ error: "Incorrect email" });
    // pass check
    const validPass = await bcrypt.compare(password, user.rows[0].password);
    console.log(validPass);
    if (!validPass)
      return res.status(401).json({ error: "Incorrect password" });
    // jwt
    let tokens = jwtTokens(user.rows[0]);
    res.json(tokens);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
const signup = async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const connection = await getConnection();
    await connection.connect();
    const newUser = await connection.query(
      'INSERT INTO "Users" ("fullName","email","password") VALUES ($1,$2,$3) RETURNING *',
      [req.body.name, req.body.email, hashedPassword]
    );
    res.json({ users: newUser.rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { login , signup};
