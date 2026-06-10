const express = require("express");
const controller = require("../controllers/chatController");
const verifyToken = require("../middlewares/verifyToken");
const authorize = require("../middlewares/authorize");

const router = express.Router();

router.use(verifyToken);
router.post("/open-admin", controller.openConversation);
router.post("/open-with-user/:userId", authorize("admin"), controller.openConversationWithUser);
router.get("/conversations", controller.getConversations);
router.get("/conversations/:conversationId/messages", controller.getMessages);

module.exports = router;
