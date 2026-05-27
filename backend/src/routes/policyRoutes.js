const express = require("express");
const controller = require("../controllers/policyController");
const auth = require("../middlewares/authMiddleware");

const router = express.Router();
router.use(auth);
router.get("/state", controller.policyState);
router.post("/accept", controller.acceptPolicy);

module.exports = router;
