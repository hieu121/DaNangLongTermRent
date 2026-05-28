const { DataTypes } = require("sequelize");
const sequelize = require("../../config/sequelize");

const Review = sequelize.define("Review", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  listing_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  tenant_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  rating: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  comment: {
    type: DataTypes.TEXT,
    allowNull: true
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
  tableName: "reviews",
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ["listing_id", "tenant_id"]
    }
  ]
});

module.exports = Review;
