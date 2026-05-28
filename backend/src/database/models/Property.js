const { DataTypes } = require("sequelize");
const sequelize = require("../../config/sequelize");

const Property = sequelize.define("Property", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  owner_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  price: {
    type: DataTypes.DECIMAL(12, 2),
    allowNull: false
  },
  area: {
    type: DataTypes.STRING,
    allowNull: false
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  min_stay: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  available_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM("pending", "active", "rejected", "inactive"),
    defaultValue: "pending"
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: "listings",
  timestamps: false
});

module.exports = Property;
