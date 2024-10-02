const express = require('express');
const router = express.Router();
const { changeNameOfGroup, deleteUser } = require('../controllers/adminOperations');
const isAdminOfThatGroup = require('../middleware/isAdmin');
const authenticate = require('../middleware/authorization.middleware');

/**
 * @swagger
 * /groups/{id}/change-name:
 *   put:
 *     summary: Change the name of a group
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The group ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               newName:
 *                 type: string
 *                 description: The new name of the group
 *     responses:
 *       200:
 *         description: Group name updated successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Authorization information is missing or invalid
 *       404:
 *         description: A group with the specified ID was not found
 *     security:
 *       - bearerAuth: []
 */
router.put("/groups/:id/change-name", authenticate,isAdminOfThatGroup, changeNameOfGroup);

/**
 * @swagger
 * /groups/{id}/remove-user:
 *   delete:
 *     summary: Remove a user from a group
 *     tags: [Admin]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The group ID
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID to remove from the group
 *     responses:
 *       200:
 *         description: User removed from the group successfully
 *       400:
 *         description: Bad request if user ID is not provided
 *       401:
 *         description: Authorization information is missing or invalid
 *       404:
 *         description: A group or user with the specified ID was not found
 *     security:
 *       - bearerAuth: []
 */
router.delete("/groups/:id/remove-user", authenticate,isAdminOfThatGroup, deleteUser);

module.exports = router;
