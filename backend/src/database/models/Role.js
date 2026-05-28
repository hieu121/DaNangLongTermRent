const { DataTypes } = require("sequelize");
const sequelize = require("../../config/sequelize");

const Role = sequelize.define("Role", {
  name: {
    type: DataTypes.STRING(32),
    primaryKey: true
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: "roles",
  timestamps: false
});

module.exports = Role;
