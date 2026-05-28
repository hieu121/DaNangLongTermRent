module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("reviews", "owner_reply", {
      type: Sequelize.TEXT,
      allowNull: true
    });
    await queryInterface.addColumn("reviews", "owner_replied_at", {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn("reviews", "owner_reply");
    await queryInterface.removeColumn("reviews", "owner_replied_at");
  }
};
