const express = require("express");
const controller = require("../controllers/amenityController");

const router = express.Router();

router.get("/", controller.getAmenities);

module.exports = router;
