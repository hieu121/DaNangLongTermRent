module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("reviews", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      listing_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "listings", key: "id" },
        onDelete: "CASCADE"
      },
      tenant_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE"
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    await queryInterface.addIndex("reviews", ["listing_id"]);
    await queryInterface.addIndex("reviews", ["tenant_id"]);
    await queryInterface.addIndex("reviews", ["listing_id", "tenant_id"], {
      unique: true
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("reviews");
  }
};
