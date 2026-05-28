const express = require("express");
const controller = require("../controllers/policyController");
const verifyToken = require("../middlewares/verifyToken");

const router = express.Router();
router.use(verifyToken);
router.get("/state", controller.policyState);
router.post("/accept", controller.acceptPolicy);

module.exports = router;
