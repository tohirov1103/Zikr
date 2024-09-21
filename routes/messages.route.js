const express = require('express');
const router = express.Router();

// Import your controller functions
const { sendMessage, getMessages, updateMessage, deleteMessage } = require('../controllers/messages.controller');

/**
 * @swagger
 * /messages:
 *   post:
 *     summary: Send a new message
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               groupId:
 *                 type: integer
 *                 description: The ID of the group to which the message is sent
 *               userId:
 *                 type: integer
 *                 description: The ID of the user sending the message
 *               messageText:
 *                 type: string
 *                 description: The content of the message
 *     responses:
 *       200:
 *         description: Message sent successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */

router.post('/messages', sendMessage);

/**
 * @swagger
 * /messages/{groupId}:
 *   get:
 *     summary: Get all messages for a group
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: groupId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the group
 *     responses:
 *       200:
 *         description: A list of messages
 *       404:
 *         description: Group not found
 */

router.get('/messages/:groupId', getMessages);

/**
 * @swagger
 * /messages/{messageId}:
 *   put:
 *     summary: Update a message
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: messageId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the message to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: The ID of the user updating the message
 *               messageText:
 *                 type: string
 *                 description: The new text of the message
 *     responses:
 *       200:
 *         description: Message updated successfully
 *       404:
 *         description: Message not found
 */

router.put('/messages/:messageId', updateMessage);

/**
 * @swagger
 * /messages/{messageId}:
 *   delete:
 *     summary: Delete a message
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: messageId
 *         schema:
 *           type: integer
 *         required: true
 *         description: The ID of the message to delete
 *     responses:
 *       200:
 *         description: Message deleted successfully
 *       404:
 *         description: Message not found
 */

router.delete('/messages/:messageId', deleteMessage);

module.exports = router;
