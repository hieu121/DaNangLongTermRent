module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("cart_items", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      tenant_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE"
      },
      listing_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "listings", key: "id" },
        onDelete: "CASCADE"
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    await queryInterface.addIndex("cart_items", ["tenant_id", "listing_id"], {
      unique: true,
      name: "cart_items_tenant_listing_unique"
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("cart_items");
  }
};
