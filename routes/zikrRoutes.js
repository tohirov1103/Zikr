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
 *     summary: Add a new Zikr
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
 *               name:
 *                 type: string
 *               desc:
 *                 type: string
 *               body:
 *                 type: string
 *               sound_url:
 *                 type: string
 *             required:
 *               - name
 *     responses:
 *       200:
 *         description: Zikr created successfully
 *       400:
 *         description: Missing required parameters
 *       500:
 *         description: Internal server error
 */
router.post('/zikr', authenticate, newZikr);

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