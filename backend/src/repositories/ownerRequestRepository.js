const { LandlordRequest, User } = require("../database/models");
const { Op } = require("sequelize");

const createRequest = async (userId) => {
  const existing = await LandlordRequest.findOne({
    where: { user_id: userId, status: "pending" }
  });
  if (existing) {
    throw new Error("You already have a pending request");
  }
  const request = await LandlordRequest.create({ user_id: userId });
  return request.id;
};

const findByUserId = async (userId) => {
  const requests = await LandlordRequest.findAll({
    where: { user_id: userId },
    order: [["created_at", "DESC"]]
  });
  return requests.map((r) => r.get({ plain: true }));
};

const findPendingRequests = async () => {
  const requests = await LandlordRequest.findAll({
    where: { status: "pending" },
    include: [
      {
        model: User,
        attributes: ["id", "email", "full_name", "phone", "created_at"]
      }
    ],
    order: [["created_at", "ASC"]]
  });
  return requests.map((r) => r.get({ plain: true }));
};

const findById = async (id) => {
  const request = await LandlordRequest.findByPk(id);
  return request ? request.get({ plain: true }) : null;
};

const updateStatus = async (id, status, reviewedBy, note) => {
  await LandlordRequest.update(
    {
      status,
      reviewed_by: reviewedBy,
      reviewed_at: new Date(),
      note: note || null
    },
    { where: { id } }
  );
};

module.exports = {
  createRequest,
  findByUserId,
  findPendingRequests,
  findById,
  updateStatus
};
