const jwt = require('jsonwebtoken');
const { getConnection } = require("../db/connectDb");
const bcrypt = require("bcrypt");
const { jwtTokens } = require("../utils/jwt-helper");

const login = async (req, res) => {
  try {
    const { mail, phone, password } = req.query;

    // Check if at least mail or phone is provided
    if (!mail && !phone) {
      return res.status(400).json({ error: "Email or phone number is required" });
    }

    const connection = await getConnection();
    let query, user;

    // Fetch user based on mail or phone
    if (mail) {
      query = 'SELECT * FROM user WHERE mail = ?';
      [user] = await connection.query(query, [mail]);
    } else if (phone) {
      query = 'SELECT * FROM user WHERE phone = ?';
      [user] = await connection.query(query, [phone]);
    }

    // Check if user exists
    if (user.length === 0) {
      return res.status(401).json({ error: "Incorrect email or phone number" });
    }

    // Check if the provided password is correct
    const validPass = await bcrypt.compare(password, user[0].password);
    if (!validPass) {
      return res.status(401).json({ error: "Incorrect password" });
    }

    // Generate JWT token after successful login
    const token = jwt.sign(
      { userId: user[0].userId, mail: user[0].mail, phone: user[0].phone }, // Payload
      process.env.JWT_SECRET, // Secret key from environment variable
    );
    console.log(user[0].userId);
    

    // Send token and user data in response
    return res.status(200).json({
      message: "User logged in successfully",
      token,
      user: {
        id: user[0].userId,
        name: user[0].name,
        surname: user[0].surname,
        mail: user[0].mail,
        phone: user[0].phone,
        image_url: user[0].image_url
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};



const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const connection = await getConnection();

    // Check if the email already exists
    const checkUserQuery = 'SELECT * FROM `Users` WHERE email = ?';
    const [existingUser] = await connection.query(checkUserQuery, [email]);

    if (existingUser.length > 0) {
      return res.status(409).json({ error: "Email already registered" });
    }

    // Insert new user
    const insertUserQuery = 'INSERT INTO `Users` (`fullName`, `email`, `password`) VALUES (?, ?, ?)';
    const [newUser] = await connection.query(insertUserQuery, [name, email, hashedPassword]);

    res.status(201).json({ user: { id: newUser.insertId, name, email } });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { login, signup };
