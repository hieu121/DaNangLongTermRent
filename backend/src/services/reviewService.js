const reviewRepository = require("../repositories/reviewRepository");

const upsertReview = async (tenantId, payload) =>
  reviewRepository.upsertReview({ tenantId, ...payload });

const getListingReviews = async (listingId) => reviewRepository.getListingReviews(listingId);

const updateReview = async (reviewId, tenantId, payload) => {
  const review = await reviewRepository.findByPk(reviewId);
  if (!review) throw Object.assign(new Error("Review not found"), { status: 404 });
  if (Number(review.tenant_id) !== Number(tenantId)) {
    throw Object.assign(new Error("Not your review"), { status: 403 });
  }
  await reviewRepository.updateReview(reviewId, tenantId, payload);
};

const deleteReview = async (reviewId, userId, userRole) => {
  const review = await reviewRepository.findByPk(reviewId);
  if (!review) throw Object.assign(new Error("Review not found"), { status: 404 });
  if (userRole !== "admin" && Number(review.tenant_id) !== Number(userId)) {
    throw Object.assign(new Error("Not your review"), { status: 403 });
  }
  await reviewRepository.deleteReview(reviewId, review.tenant_id);
};

const replyToReview = async (reviewId, ownerId, ownerReply) => {
  const review = await reviewRepository.findByPk(reviewId);
  if (!review) throw Object.assign(new Error("Review not found"), { status: 404 });
  await reviewRepository.replyToReview(reviewId, ownerReply);
};

module.exports = { upsertReview, getListingReviews, updateReview, deleteReview, replyToReview };
