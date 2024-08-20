const express = require("express");
const router = express.Router();
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
  showGroupProfile,
  showGroupSubs,
  leaveGroup
} = require("../controllers/operations");
// Get img and name of user route
router.post("/userId/:userId/poraId/:poraId", chooseJuz);
// Post(Create) group
router.post("/hatm/createGroup/:id", createGroup);
// Get all groups
router.get("/getAll", getAllGroups);
// Get public groups
router.get("/getPublic/:id", getPublicGroups);
// Get private groups
router.get("/getPrivate/:id", getPrivateGroups);
//
// Find Invinting user
router.get("/findUser", findUser);
// Invite a user
router.post("/groups/invite/:id", inviteUser);
// Get Invites
router.get("/groups/getInvites/:id", getInvites);
// Subscribe a user
router.post("/groups/subscribe", subscribeUser);
// Cancelling juz
router.delete('/cancelJuz/user/:userId/pora/:poraId',cancelJuz);
// Finishing juz
router.put('/finishedJuz/user/:userId/pora/:poraId',finishedJuz);
// Show Group Profile
router.get('/profile/groupId/:id',showGroupProfile);
// Show Group Subs
router.get('/subs/idGroup/:id',showGroupSubs);
// Leave the groupe
router.post('/leave-group', leaveGroup);

module.exports = router;
