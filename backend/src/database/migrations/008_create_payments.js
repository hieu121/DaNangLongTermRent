module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("payments", {
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
      amount: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      method: {
        type: Sequelize.STRING,
        defaultValue: "momo"
      },
      status: {
        type: Sequelize.ENUM("pending", "success", "failed"),
        defaultValue: "pending"
      },
      momo_transaction_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    await queryInterface.createTable("payment_listing_access", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      payment_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "payments", key: "id" },
        onDelete: "CASCADE"
      },
      listing_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "listings", key: "id" },
        onDelete: "CASCADE"
      },
      unlocked: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("payment_listing_access");
    await queryInterface.dropTable("payments");
  }
};
