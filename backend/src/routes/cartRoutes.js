const express = require("express");
const controller = require("../controllers/cartController");
const verifyToken = require("../middlewares/verifyToken");
const authorize = require("../middlewares/authorize");
const policy = require("../middlewares/policyMiddleware");
const validate = require("../middlewares/validate");
const { cartItemSchema } = require("../validators/schemas");

const router = express.Router();

router.use(verifyToken, policy, authorize("tenant"));

router.get("/", controller.getCart);
router.get("/count", controller.getCartCount);
router.post("/", validate(cartItemSchema), controller.addToCart);
router.delete("/:listingId", controller.removeFromCart);

module.exports = router;
