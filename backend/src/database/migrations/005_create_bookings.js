module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("bookings", {
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
      check_in: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      check_out: {
        type: Sequelize.DATEONLY,
        allowNull: false
      },
      guests: {
        type: Sequelize.INTEGER,
        defaultValue: 1
      },
      total_price: {
        type: Sequelize.DECIMAL(12, 2),
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM("pending", "confirmed", "cancelled", "completed"),
        defaultValue: "pending"
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

    await queryInterface.addIndex("bookings", ["tenant_id"]);
    await queryInterface.addIndex("bookings", ["listing_id"]);
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("bookings");
  }
};
