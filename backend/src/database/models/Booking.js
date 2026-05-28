const { DataTypes } = require("sequelize");
const sequelize = require("../../config/sequelize");

const Booking = sequelize.define("Booking", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  tenant_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  listing_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  check_in: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  check_out: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  guests: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  total_price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM("pending", "confirmed", "cancelled", "completed"),
    defaultValue: "pending"
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: "bookings",
  timestamps: false
});

module.exports = Booking;
