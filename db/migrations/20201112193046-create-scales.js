'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('scales', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      wikiurl: {
        type: Sequelize.STRING
      },
      wikipageid: {
        type: Sequelize.STRING
      },
      binposition: {
        type: Sequelize.STRING,
        allowNull: false
      },
      numposition: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      rootnoteId: {
        type: Sequelize.INTEGER,
        onDelete: "CASCADE",
        references: {
          model: "root_notes",
          key: "id",
          as: "rootnoteId",
        },
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Scales');
  }
};
