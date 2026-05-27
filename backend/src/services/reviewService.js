const reviewRepository = require("../repositories/reviewRepository");

const upsertReview = async (tenantId, payload) =>
  reviewRepository.upsertReview({ tenantId, ...payload });

const getListingReviews = async (listingId) => reviewRepository.getListingReviews(listingId);

module.exports = { upsertReview, getListingReviews };
