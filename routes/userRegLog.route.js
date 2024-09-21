const express = require("express");
const router = express.Router();
const { newUser } = require('../Zikr/controllers/zikrOps');
const { login } = require('../controllers/loginAndSignup');

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     tags: [User Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The user's first name
 *               surname:
 *                 type: string
 *                 description: The user's last name
 *               phone:
 *                 type: string
 *                 description: The user's phone number
 *               mail:
 *                 type: string
 *                 description: The user's email address
 *               image_url:
 *                 type: string
 *                 description: URL to the user's profile picture
 *               password:
 *                 type: string
 *                 description: The user's password
 *     responses:
 *       200:
 *         description: User registered successfully
 *       400:
 *         description: Bad request, missing required fields
 *       500:
 *         description: Internal server error
 */
router.post('/register', newUser);

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login a user
 *     tags: [User Authentication]
 *     parameters:
 *       - in: query
 *         name: mail
 *         schema:
 *           type: string
 *         required: false
 *         description: The user's email address
 *       - in: query
 *         name: phone
 *         schema:
 *           type: string
 *         required: false
 *         description: The user's phone number
 *       - in: query
 *         name: password
 *         schema:
 *           type: string
 *         required: true
 *         description: The user's password
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 *       400:
 *         description: Bad request, email or phone required
 *       500:
 *         description: Internal server error
 */
router.post('/login', login);

module.exports = router;
