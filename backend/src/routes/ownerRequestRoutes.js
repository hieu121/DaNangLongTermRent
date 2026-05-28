const express = require("express");
const controller = require("../controllers/ownerRequestController");
const verifyToken = require("../middlewares/verifyToken");
const authorize = require("../middlewares/authorize");

const router = express.Router();

router.use(verifyToken);
router.post("/", authorize("tenant"), controller.requestOwner);
router.get("/my-requests", authorize("tenant"), controller.getMyRequests);

module.exports = router;
