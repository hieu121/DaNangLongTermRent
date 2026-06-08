module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("amenities", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    await queryInterface.bulkInsert("amenities", [
      { name: "Wifi" },
      { name: "Máy lạnh" },
      { name: "Máy giặt" },
      { name: "Nước nóng" },
      { name: "Chỗ để xe" },
      { name: "Ban công" }
    ]);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("amenities");
  }
};
