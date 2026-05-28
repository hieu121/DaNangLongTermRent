module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("listings", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      owner_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE"
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      price: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      area: {
        type: Sequelize.STRING,
        allowNull: false
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      min_stay: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      available_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM("pending", "active", "rejected", "inactive"),
        defaultValue: "pending"
      },
      priority_score: {
        type: Sequelize.INTEGER,
        defaultValue: 100
      },
      missed_weeks: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    await queryInterface.addIndex("listings", ["owner_id"]);
    await queryInterface.addIndex("listings", ["status"]);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("listings");
  }
};
