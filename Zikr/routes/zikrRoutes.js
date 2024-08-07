const express = require("express");
const router = express.Router();
const {newUser, newZikr, fetchGroupsByOwnerId, insertNewGroup,updateGroupTotalCount} = require('../controllers/zikrOps');

router.post('/add-user',newUser);
router.post('/add-zikr',newZikr);
router.get('/group',fetchGroupsByOwnerId);
router.post('/update-count',updateGroupTotalCount);
router.post('/add-group',insertNewGroup);

module.exports = router;
