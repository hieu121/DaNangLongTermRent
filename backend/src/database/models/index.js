const User = require("./User");
const Otp = require("./Otp");
const LandlordRequest = require("./LandlordRequest");
const Booking = require("./Booking");
const Review = require("./Review");
const Role = require("./Role");
const Property = require("./Property");

User.hasMany(LandlordRequest, { foreignKey: "user_id" });
LandlordRequest.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(LandlordRequest, { foreignKey: "reviewed_by", as: "reviewedRequests" });
LandlordRequest.belongsTo(User, { foreignKey: "reviewed_by", as: "reviewer" });

User.hasMany(Booking, { foreignKey: "tenant_id" });
Booking.belongsTo(User, { foreignKey: "tenant_id" });

User.hasMany(Review, { foreignKey: "tenant_id" });
Review.belongsTo(User, { foreignKey: "tenant_id" });

module.exports = {
  User,
  Otp,
  LandlordRequest,
  Booking,
  Review,
  Role,
  Property
};
