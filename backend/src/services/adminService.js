const userRepository = require("../repositories/userRepository");
const listingRepository = require("../repositories/listingRepository");
const listingUpdateRepository = require("../repositories/listingUpdateRepository");
const paymentRepository = require("../repositories/paymentRepository");
const adminRepository = require("../repositories/adminRepository");
const policyService = require("./policyService");
const listingService = require("./listingService");

const getDashboardStats = async () => {
  const [users, pendingListings, totalListings, revenue, pendingUpdates] = await Promise.all([
    userRepository.findAllUsers(),
    listingRepository.findPendingListings(),
    listingRepository.countListings(),
    paymentRepository.sumRevenue(),
    listingUpdateRepository.findPendingUpdates()
  ]);
  return {
    users: users.length,
    pendingListings: pendingListings.length,
    totalListings,
    pendingUpdates: pendingUpdates.length,
    revenue
  };
};

const getUserDetail = async (userId) => {
  const user = await userRepository.findUserDetailForAdmin(userId);
  if (!user) {
    throw new Error("User not found");
  }
  return user;
};

const getAllListings = async () => {
  const listings = await listingRepository.findAllListingsForAdmin();
  return listingRepository.enrichListingsWithAssets(listings);
};

const getActiveListings = async () => {
  const listings = await listingRepository.findAllActiveListings();
  return listingRepository.enrichListingsWithAssets(listings);
};

const getPendingListings = async () => {
  const listings = await listingRepository.findPendingListings();
  return listingRepository.enrichListingsWithAssets(listings);
};

const getListingDetail = async (listingId) =>
  listingService.getListingDetail(listingId, { role: "admin", id: 0 });

const deleteListing = async (listingId) => {
  const listing = await listingRepository.findListingById(listingId);
  if (!listing) {
    throw new Error("Listing not found");
  }
  await listingRepository.adminDeleteListing(listingId);
};

const reviewListing = async ({ listingId, adminId, action, note }) => {
  const listing = await listingRepository.findListingById(listingId);
  if (!listing) {
    throw new Error("Listing not found");
  }
  if (!["pending", "rejected"].includes(listing.status)) {
    throw new Error("Listing is not pending approval");
  }
  const status = action === "approve" ? "active" : "rejected";
  await listingRepository.updateListingStatus(listingId, status);
  await adminRepository.createListingReviewLog({ listingId, adminId, action, note });
};

const getPendingUpdates = async () => listingUpdateRepository.findPendingUpdates();

const reviewUpdateRequest = async ({ updateRequestId, adminId, action, note }) => {
  const request = await listingUpdateRepository.findById(updateRequestId);
  if (!request) {
    throw new Error("Update request not found");
  }
  if (request.status !== "pending") {
    throw new Error("Update request has already been processed");
  }

  if (action === "approve") {
    await listingRepository.applyListingUpdate(request.listing_id, request.proposed_data);
    await listingUpdateRepository.updateStatus(updateRequestId, "approved", adminId, note);
    return;
  }

  await listingUpdateRepository.updateStatus(updateRequestId, "rejected", adminId, note);
};

const warnOwner = async ({ ownerId, adminId, reason }) =>
  adminRepository.createOwnerWarning({ ownerId, adminId, reason });

const toggleUserStatus = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }
  if (user.role === "admin") {
    throw new Error("Cannot lock admin account");
  }
  await userRepository.updateUserDetails(userId, { isActive: !user.is_active });
};

const createPolicy = async (payload) => policyService.createPolicy(payload);

const getRevenueStats = async () => paymentRepository.getRevenueStats();

const getMonthlyRevenue = async () => paymentRepository.getMonthlyRevenue();

const getRevenueTransactions = async (filters) => paymentRepository.findTransactionsForAdmin(filters);

module.exports = {
  getDashboardStats,
  getUserDetail,
  getAllListings,
  getActiveListings,
  getPendingListings,
  getListingDetail,
  deleteListing,
  reviewListing,
  getPendingUpdates,
  reviewUpdateRequest,
  warnOwner,
  toggleUserStatus,
  createPolicy,
  getRevenueStats,
  getMonthlyRevenue,
  getRevenueTransactions
};
