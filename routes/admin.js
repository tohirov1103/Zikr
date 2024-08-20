const express = require('express');
const router = express.Router();
const { changeNameOfGroup, deleteUser } = require('../controllers/adminOperations');

// Route to change the name of a group
router.put('/group/:id/name', changeNameOfGroup);

// Route to delete a user from a group
router.delete('/group/:id/user', deleteUser);

module.exports = router;
