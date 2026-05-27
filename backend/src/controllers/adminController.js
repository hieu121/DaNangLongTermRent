const listingRepository = require("../repositories/listingRepository");
const userRepository = require("../repositories/userRepository");
const adminService = require("../services/adminService");
const { success } = require("../utils/response");

const getPendingListings = async (req, res, next) => {
  try {
    const data = await listingRepository.findPendingListings();
    return success(res, data);
  } catch (error) {
    return next(error);
  }
};

const reviewListing = async (req, res, next) => {
  try {
    await adminService.reviewListing({
      listingId: req.body.listingId,
      adminId: req.user.id,
      action: req.body.action,
      note: req.body.note
    });
    return success(res, null, "Listing reviewed");
  } catch (error) {
    return next(error);
  }
};

const warnOwner = async (req, res, next) => {
  try {
    await adminService.warnOwner({
      ownerId: req.body.ownerId,
      adminId: req.user.id,
      reason: req.body.reason
    });
    return success(res, null, "Owner warned");
  } catch (error) {
    return next(error);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const data = await userRepository.findAllUsers();
    return success(res, data);
  } catch (error) {
    return next(error);
  }
};

const createPolicy = async (req, res, next) => {
  try {
    const policyId = await adminService.createPolicy(req.body);
    return success(res, { policyId }, "Policy created", 201);
  } catch (error) {
    return next(error);
  }
};

const stats = async (req, res, next) => {
  try {
    const data = await adminService.getDashboardStats();
    return success(res, data);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getPendingListings,
  reviewListing,
  warnOwner,
  getUsers,
  createPolicy,
  stats
};
