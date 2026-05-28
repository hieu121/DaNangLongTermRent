const userRepository = require("../repositories/userRepository");
const ownerRequestRepository = require("../repositories/ownerRequestRepository");

const createRequest = async (userId) => {
  const user = await userRepository.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }
  if (user.role !== "tenant") {
    throw new Error("Only tenants can request to become an owner");
  }
  return ownerRequestRepository.createRequest(userId);
};

const getMyRequests = async (userId) => {
  return ownerRequestRepository.findByUserId(userId);
};

const approveRequest = async (requestId, adminId) => {
  const request = await ownerRequestRepository.findById(requestId);
  if (!request) {
    throw new Error("Request not found");
  }
  if (request.status !== "pending") {
    throw new Error("Request has already been processed");
  }

  await ownerRequestRepository.updateStatus(requestId, "approved", adminId, null);
  await userRepository.updateUserDetails(request.user_id, { role: "owner" });
  return { userId: request.user_id };
};

const rejectRequest = async (requestId, adminId, note) => {
  const request = await ownerRequestRepository.findById(requestId);
  if (!request) {
    throw new Error("Request not found");
  }
  if (request.status !== "pending") {
    throw new Error("Request has already been processed");
  }

  await ownerRequestRepository.updateStatus(requestId, "rejected", adminId, note);
  return { userId: request.user_id };
};

const getPendingRequests = async () => {
  return ownerRequestRepository.findPendingRequests();
};

module.exports = {
  createRequest,
  getMyRequests,
  approveRequest,
  rejectRequest,
  getPendingRequests
};
