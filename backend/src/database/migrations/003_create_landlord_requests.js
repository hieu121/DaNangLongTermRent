module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("landlord_requests", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE"
      },
      status: {
        type: Sequelize.ENUM("pending", "approved", "rejected"),
        defaultValue: "pending"
      },
      reviewed_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: { model: "users", key: "id" },
        onDelete: "SET NULL"
      },
      reviewed_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      note: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    await queryInterface.addIndex("landlord_requests", ["user_id"]);
    await queryInterface.addIndex("landlord_requests", ["status"]);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("landlord_requests");
  }
};
