module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("otps", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false
      },
      code: {
        type: Sequelize.STRING(6),
        allowNull: false
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      is_used: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    await queryInterface.addIndex("otps", ["email"]);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("otps");
  }
};
