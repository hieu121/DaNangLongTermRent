const cartService = require("../services/cartService");
const { success } = require("../utils/response");

const getCart = async (req, res, next) => {
  try {
    const data = await cartService.getCart(req.user.id);
    return success(res, data);
  } catch (error) {
    return next(error);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const data = await cartService.addToCart(req.user.id, Number(req.body.listingId));
    return success(res, data, "Đã thêm vào giỏ hàng");
  } catch (error) {
    return next(error);
  }
};

const removeFromCart = async (req, res, next) => {
  try {
    const data = await cartService.removeFromCart(req.user.id, Number(req.params.listingId));
    return success(res, data, "Đã xóa khỏi giỏ hàng");
  } catch (error) {
    return next(error);
  }
};

const getCartCount = async (req, res, next) => {
  try {
    const count = await cartService.getCartCount(req.user.id);
    return success(res, { count });
  } catch (error) {
    return next(error);
  }
};

module.exports = { getCart, addToCart, removeFromCart, getCartCount };
