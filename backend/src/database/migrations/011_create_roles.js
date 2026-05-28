module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("roles", {
      name: {
        type: Sequelize.STRING(32),
        primaryKey: true
      },
      description: {
        type: Sequelize.STRING,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    await queryInterface.bulkInsert("roles", [
      { name: "tenant", description: "Tenant user with booking and review rights" },
      { name: "owner", description: "Owner user with listing management rights" },
      { name: "admin", description: "Administrator with full management rights" }
    ], {});
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("roles");
  }
};
