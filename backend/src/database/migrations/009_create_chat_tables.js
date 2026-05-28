module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("conversations", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      }
    });

    await queryInterface.createTable("conversation_participants", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      conversation_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "conversations", key: "id" },
        onDelete: "CASCADE"
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE"
      }
    });

    await queryInterface.createTable("messages", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      conversation_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "conversations", key: "id" },
        onDelete: "CASCADE"
      },
      sender_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: { model: "users", key: "id" },
        onDelete: "CASCADE"
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("messages");
    await queryInterface.dropTable("conversation_participants");
    await queryInterface.dropTable("conversations");
  }
};
