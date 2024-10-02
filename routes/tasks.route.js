const express = require("express");
const router = express.Router();
const authenticate = require('../middleware/authorization.middleware');
const {
  chooseJuz,
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
  showGroupDetails,
  leaveGroup,
} = require("../controllers/operations");

/**
 * @swagger
 * /userId/{userId}/poraId/{poraId}:
 *   post:
 *     summary: Choose a Juz for a user within a group
 *     tags: [Group Operations]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID choosing the Juz
 *       - in: path
 *         name: poraId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The Juz ID being chosen
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idGroup:
 *                 type: integer
 *                 description: The group ID where the Juz is being chosen
 *     responses:
 *       200:
 *         description: Juz chosen successfully
 *       400:
 *         description: Bad request
 *       404:
 *         description: User or Juz not found
 */
router.post("/userId/:userId/poraId/:poraId",authenticate, chooseJuz);

/**
 * @swagger
 * /hatm/group/{adminId}:
 *   post:
 *     summary: Create a new group
 *     tags: [Group Operations]
 *     parameters:
 *       - in: path
 *         name: adminId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The admin user ID creating the group
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Name of the group
 *               isPublic:
 *                 type: boolean
 *                 description: Whether the group is public
 *               kimga:
 *                 type: string
 *                 description: Purpose of the group
 *               guruhImg:
 *                 type: string
 *                 description: URL to an image representing the group
 *               hatmSoni:
 *                 type: integer
 *                 description: Number of times the Quran is to be recited in the group
 *     responses:
 *       200:
 *         description: Group created successfully
 *       400:
 *         description: Invalid input, object invalid
 *       401:
 *         description: Unauthorized
 */
router.post("/hatm/group/:adminId",authenticate, createGroup);

/**
 * @swagger
 * /getAll:
 *   get:
 *     summary: Retrieve all groups associated with a user
 *     tags: [Group Operations]
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID to retrieve groups for
 *       - in: query
 *         name: groupType
 *         required: false
 *         schema:
 *           type: string
 *           enum: [quran, zikr]
 *         description: Optional filter to only return groups of a specific type (quran or zikr)
 *     responses:
 *       200:
 *         description: A list of groups
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *       404:
 *         description: No groups found
 *       500:
 *         description: Internal server error
 */
router.get("/getAll",authenticate, getAllGroups);

/**
 * @swagger
 * /groups/public:
 *   get:
 *     summary: Get all public groups
 *     tags: [Group Operations]
 *     responses:
 *       200:
 *         description: List of public groups
 *       404:
 *         description: No public groups found
 */
router.get('/groups/public',authenticate, getPublicGroups);

/**
 * @swagger
 * /groups/private:
 *   get:
 *     summary: Get all private groups
 *     tags: [Group Operations]
 *     responses:
 *       200:
 *         description: List of private groups
 *       404:
 *         description: No private groups found
 */
router.get('/groups/private',authenticate, getPrivateGroups);

/**
 * @swagger
 * /findUser:
 *   get:
 *     summary: Find a user by phone number
 *     tags: [User Operations]
 *     parameters:
 *       - in: query
 *         name: phone
 *         required: true
 *         schema:
 *           type: string
 *         description: The phone number of the user to find
 *     responses:
 *       200:
 *         description: User found
 *       404:
 *         description: User not found
 */
router.get("/findUser",authenticate, findUser);

/**
 * @swagger
 * /groups/invite/{id}:
 *   post:
 *     summary: Invite a user to a group
 *     tags: [Group Operations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user to invite
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               groupId:
 *                 type: integer
 *                 description: The group ID to invite the user to
 *               isInvite:
 *                 type: boolean
 *                 description: Whether the invitation is confirmed
 *     responses:
 *       200:
 *         description: User invited successfully
 *       400:
 *         description: Bad request
 */
router.post("/groups/invite/:id", authenticate,inviteUser);

/**
 * @swagger
 * /groups/getInvites/{id}:
 *   get:
 *     summary: Get a list of invites for a user
 *     tags: [User Operations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user
 *     responses:
 *       200:
 *         description: List of invites
 *       404:
 *         description: No invites found for the user
 */
router.get("/groups/getInvites/:id",authenticate, getInvites);

/**
 * @swagger
 * /groups/subscribe:
 *   post:
 *     summary: Subscribe a user to a group
 *     tags: [Group Operations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: The ID of the user subscribing to the group
 *               groupId:
 *                 type: integer
 *                 description: The ID of the group the user is subscribing to
 *     responses:
 *       200:
 *         description: User subscribed successfully
 *       400:
 *         description: Bad request
 */
router.post("/groups/subscribe",authenticate, subscribeUser);

/**
 * @swagger
 * /cancelJuz/user/{userId}/pora/{poraId}:
 *   delete:
 *     summary: Cancel a Juz booking for a user
 *     tags: [Group Operations]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID
 *       - in: path
 *         name: poraId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The Juz ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idGroup:
 *                 type: integer
 *                 description: The group ID
 *     responses:
 *       200:
 *         description: Juz booking canceled
 *       404:
 *         description: Juz or user not found
 */
router.delete('/cancelJuz/user/:userId/pora/:poraId',authenticate, cancelJuz);

/**
 * @swagger
 * /finishedJuz/user/{userId}/pora/{poraId}:
 *   put:
 *     summary: Mark a Juz as finished for a user
 *     tags: [Group Operations]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The user ID
 *       - in: path
 *         name: poraId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The Juz ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               idGroup:
 *                 type: integer
 *                 description: The group ID
 *     responses:
 *       200:
 *         description: Juz marked as finished
 *       404:
 *         description: Juz or user not found
 */
router.put('/finishedJuz/user/:userId/pora/:poraId',authenticate,finishedJuz);

/**
 * @swagger
 * /groups/{id}/details:
 *   get:
 *     summary: Show details of a group
 *     tags: [Group Operations]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The group ID
 *     responses:
 *       200:
 *         description: Group details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 name:
 *                   type: string
 *                   description: The name of the group
 *                 kimga:
 *                   type: string
 *                   description: The purpose of the group
 *                 hatmSoni:
 *                   type: integer
 *                   description: The number of times the Quran is to be recited in the group
 *       404:
 *         description: Group not found
 */
router.get("/groups/:id/details",authenticate, showGroupDetails);

/**
 * @swagger
 * /leave-group:
 *   post:
 *     summary: Leave a group
 *     tags: [Group Operations]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: The ID of the user leaving the group
 *               groupId:
 *                 type: integer
 *                 description: The ID of the group to leave
 *     responses:
 *       200:
 *         description: User successfully left the group
 *       404:
 *         description: Group or user not found
 */
router.post('/leave-group',authenticate, leaveGroup);


module.exports = router;



