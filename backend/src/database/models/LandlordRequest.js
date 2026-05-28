const { DataTypes } = require("sequelize");
const sequelize = require("../../config/sequelize");

const LandlordRequest = sequelize.define("LandlordRequest", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM("pending", "approved", "rejected"),
    defaultValue: "pending"
  },
  reviewed_by: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  reviewed_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  note: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: "landlord_requests",
  timestamps: false
});

module.exports = LandlordRequest;
