const listingService = require("../services/listingService");
const listingRepository = require("../repositories/listingRepository");
const { success } = require("../utils/response");

const createListing = async (req, res, next) => {
  try {
    const listingId = await listingService.createListing(req.user.id, req.body);
    return success(res, { listingId }, "Listing submitted", 201);
  } catch (error) {
    return next(error);
  }
};

const getListings = async (req, res, next) => {
  try {
    const data = await listingService.getListings(req.query);
    return success(res, data);
  } catch (error) {
    return next(error);
  }
};

const getListingDetail = async (req, res, next) => {
  try {
    const data = await listingService.getListingDetail(Number(req.params.id), req.user);
    return success(res, data);
  } catch (error) {
    return next(error);
  }
};

const markListingUpdated = async (req, res, next) => {
  try {
    await listingRepository.resetMissedWeeks(Number(req.params.id));
    return success(res, null, "Listing refresh score reset");
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  createListing,
  getListings,
  getListingDetail,
  markListingUpdated
};
