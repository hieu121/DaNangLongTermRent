const reviewService = require("../services/reviewService");
const { success } = require("../utils/response");

const upsertReview = async (req, res, next) => {
  try {
    await reviewService.upsertReview(req.user.id, {
      listingId: req.body.listingId,
      rating: req.body.rating,
      comment: req.body.comment
    });
    return success(res, null, "Review saved");
  } catch (error) {
    return next(error);
  }
};

const getListingReviews = async (req, res, next) => {
  try {
    const data = await reviewService.getListingReviews(Number(req.params.listingId));
    return success(res, data);
  } catch (error) {
    return next(error);
  }
};

module.exports = { upsertReview, getListingReviews };
