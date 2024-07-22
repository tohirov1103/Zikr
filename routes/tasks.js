const express = require("express");
const router = express.Router();
const {
  getHatm,
  chooseHatm,
  createGroup,
  getAllGroups,
  getPublicGroups,
  getPrivateGroups,
  findUser,
  inviteUser,
  getInvites,
  subscribeUser,
  finishedJuz,
  cancelJuz
} = require("../controllers/operations");
// Get Hatm route
router.get("/hatm", getHatm);
// Get img and name of user route
router.post("/userId/poraId", chooseHatm);
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
router.get("/findUses", findUser);
// Invite a user
router.post("/groups/invite/:id", inviteUser);
// Get Invites
router.get("/groups/getall", getInvites);
// Subscribe a user
router.post("/groups/subscribe", subscribeUser);
//
router.delete('/pora/user',cancelJuz);
router.delete('user/pora',finishedJuz);

module.exports = router;
