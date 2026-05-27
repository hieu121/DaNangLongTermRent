const userRepository = require("../repositories/userRepository");
const listingRepository = require("../repositories/listingRepository");
const paymentRepository = require("../repositories/paymentRepository");
const adminRepository = require("../repositories/adminRepository");
const policyService = require("./policyService");

const getDashboardStats = async () => {
  const [users, pendingListings, totalListings, revenue] = await Promise.all([
    userRepository.findAllUsers(),
    listingRepository.findPendingListings(),
    listingRepository.countListings(),
    paymentRepository.sumRevenue()
  ]);
  return {
    users: users.length,
    pendingListings: pendingListings.length,
    totalListings,
    revenue
  };
};

const reviewListing = async ({ listingId, adminId, action, note }) => {
  const status = action === "approve" ? "active" : "rejected";
  await listingRepository.updateListingStatus(listingId, status);
  await adminRepository.createListingReviewLog({ listingId, adminId, action, note });
};

const warnOwner = async ({ ownerId, adminId, reason }) =>
  adminRepository.createOwnerWarning({ ownerId, adminId, reason });

const createPolicy = async (payload) => policyService.createPolicy(payload);

module.exports = { getDashboardStats, reviewListing, warnOwner, createPolicy };
