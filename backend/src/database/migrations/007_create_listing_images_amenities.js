module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("listing_images", {
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
      image_url: {
        type: Sequelize.TEXT,
        allowNull: false
      }
    });

    await queryInterface.createTable("listing_amenities", {
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
      amenity: {
        type: Sequelize.STRING,
        allowNull: false
      }
    });

    await queryInterface.createTable("listing_reviews", {
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
      admin_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE"
      },
      action: {
        type: Sequelize.ENUM("approve", "reject"),
        allowNull: false
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
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("listing_reviews");
    await queryInterface.dropTable("listing_amenities");
    await queryInterface.dropTable("listing_images");
  }
};
