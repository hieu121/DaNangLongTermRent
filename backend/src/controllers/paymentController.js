const paymentService = require("../services/paymentService");
const { success } = require("../utils/response");

const mockMomoPayment = async (req, res, next) => {
  try {
    const data = await paymentService.createMockMomoPayment({
      tenantId: req.user.id,
      listingId: req.body.listingId
    });
    return success(res, data, "Thanh toán MoMo thành công");
  } catch (error) {
    return next(error);
  }
};

const momoCheckout = async (req, res, next) => {
  try {
    const data = await paymentService.processMomoCheckout({
      tenantId: req.user.id,
      listingIds: req.body.listingIds
    });
    return success(res, data, "Thanh toán MoMo thành công");
  } catch (error) {
    return next(error);
  }
};

const getMyPayments = async (req, res, next) => {
  try {
    const data = await paymentService.getMyPayments(req.user.id);
    return success(res, data);
  } catch (error) {
    return next(error);
  }
};

const getPurchasedListings = async (req, res, next) => {
  try {
    const data = await paymentService.getPurchasedListings(req.user.id);
    return success(res, data);
  } catch (error) {
    return next(error);
  }
};

const getUnlockPrice = async (req, res, next) => {
  try {
    return success(res, { unlockPrice: paymentService.CONTACT_UNLOCK_PRICE });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  mockMomoPayment,
  momoCheckout,
  getMyPayments,
  getPurchasedListings,
  getUnlockPrice
};
