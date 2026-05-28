const listingRepository = require("../repositories/listingRepository");
const userRepository = require("../repositories/userRepository");
const adminService = require("../services/adminService");
const ownerRequestService = require("../services/ownerRequestService");
const policyService = require("../services/policyService");
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

const toggleUserStatus = async (req, res, next) => {
  try {
    await adminService.toggleUserStatus(Number(req.params.userId));
    return success(res, null, "User status updated");
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

const getOwnerRequests = async (req, res, next) => {
  try {
    const data = await ownerRequestService.getPendingRequests();
    return success(res, data);
  } catch (error) {
    return next(error);
  }
};

const approveOwnerRequest = async (req, res, next) => {
  try {
    await ownerRequestService.approveRequest(Number(req.params.requestId), req.user.id);
    return success(res, null, "Owner request approved");
  } catch (error) {
    return next(error);
  }
};

const rejectOwnerRequest = async (req, res, next) => {
  try {
    await ownerRequestService.rejectRequest(
      Number(req.params.requestId),
      req.user.id,
      req.body.note
    );
    return success(res, null, "Owner request rejected");
  } catch (error) {
    return next(error);
  }
};

const getPolicies = async (req, res, next) => {
  try {
    const data = await policyService.getAllPolicies();
    return success(res, data);
  } catch (error) {
    return next(error);
  }
};

const updatePolicy = async (req, res, next) => {
  try {
    await policyService.updatePolicy(Number(req.params.id), req.body);
    return success(res, null, "Policy updated");
  } catch (error) {
    return next(error);
  }
};

const deletePolicy = async (req, res, next) => {
  try {
    await policyService.deletePolicy(Number(req.params.id));
    return success(res, null, "Policy deleted");
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getPendingListings,
  reviewListing,
  warnOwner,
  getUsers,
  toggleUserStatus,
  createPolicy,
  stats,
  getOwnerRequests,
  approveOwnerRequest,
  rejectOwnerRequest,
  getPolicies,
  updatePolicy,
  deletePolicy
};
