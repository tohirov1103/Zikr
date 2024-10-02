const express = require('express');
const router = express.Router();
const {
  createZikrGoal,
  newZikr,
  fetchGroups,
  insertNewGroup,
  addZikrCountForGroup
} = require('../Zikr/controllers/zikrOps');
const authenticate = require('../middleware/authorization.middleware');

/**
 * @swagger
 * /zikr-goal:
 *   post:
 *     summary: Create a Zikr goal for a group
 *     tags: [Zikr]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               zikrId:
 *                 type: integer
 *               groupId:
 *                 type: integer
 *               goal:
 *                 type: integer
 *             required:
 *               - zikrId
 *               - groupId
 *               - goal
 *     responses:
 *       200:
 *         description: Zikr goal created successfully
 *       400:
 *         description: Missing required parameters
 *       500:
 *         description: Internal server error
 */
router.post('/zikr-goal', authenticate, createZikrGoal);

/**
 * @swagger
 * /zikr:
 *   post:
 *     tags:
 *       - Zikr
 *     summary: Create a new Zikr
 *     description: This route allows the user to create a new Zikr for a group with a specific goal.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the Zikr
 *                 example: Morning Prayer
 *               desc:
 *                 type: string
 *                 description: Description of the Zikr
 *                 example: A zikr for early morning blessings
 *               body:
 *                 type: string
 *                 description: The phrases for the Zikr
 *                 example: Subhanallah, Alhamdulillah, Allahu Akbar
 *               sound_url:
 *                 type: string
 *                 description: URL of the sound associated with the Zikr
 *                 example: http://example.com/sounds/morningprayer.mp3
 *               goal:
 *                 type: integer
 *                 description: The goal for how many times the zikr should be repeated
 *                 example: 1000
 *               groupId:
 *                 type: integer
 *                 description: The ID of the group associated with this Zikr
 *                 example: 123
 *     responses:
 *       201:
 *         description: Zikr created successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Internal server error
 */
router.post('/zikr', authenticate,newZikr);  // Route for creating a new zikr

/**
 * @swagger
 * /groups:
 *   get:
 *     summary: Fetch groups by ownerId or groupType
 *     tags: [Zikr]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: ownerId
 *         in: query
 *         schema:
 *           type: integer
 *         description: Filter groups by owner ID
 *       - name: groupType
 *         in: query
 *         schema:
 *           type: string
 *         description: Filter groups by type (e.g., Zikr or Quran)
 *     responses:
 *       200:
 *         description: List of groups
 *       500:
 *         description: Internal server error
 */
router.get('/groups', authenticate, fetchGroups);

/**
 * @swagger
 * /groups:
 *   post:
 *     summary: Create a new group (Zikr or Quran)
 *     tags: [Zikr]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               ownerId:
 *                 type: integer
 *               name:
 *                 type: string
 *               groupType:
 *                 type: string
 *                 enum: [zikr, quran]
 *               isPublic:
 *                 type: boolean
 *               image_url:
 *                 type: string
 *               hatmSoni:
 *                 type: integer
 *             required:
 *               - ownerId
 *               - name
 *               - groupType
 *     responses:
 *       200:
 *         description: Group created successfully
 *       400:
 *         description: Missing required parameters
 *       500:
 *         description: Internal server error
 */
router.post('/groups', authenticate, insertNewGroup);

/**
 * @swagger
 * /zikr-count:
 *   post:
 *     summary: Add zikr count for a specific group
 *     tags: [Zikr]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               groupId:
 *                 type: integer
 *               zikrId:
 *                 type: integer
 *               count:
 *                 type: integer
 *             required:
 *               - groupId
 *               - zikrId
 *               - count
 *     responses:
 *       200:
 *         description: Zikr count updated successfully
 *       400:
 *         description: Missing required parameters
 *       500:
 *         description: Internal server error
 */
router.post('/zikr-count', authenticate, addZikrCountForGroup);

module.exports = router;