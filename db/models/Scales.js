const Sequelize = require('sequelize');
const db = require('../server');

const Scales = db.sequelize.define('Scales', {
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
    allowNull: false,
  },
  numposition: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  rootnoteId: {
    type: Sequelize.INTEGER,
    onDelete: "CASCADE",
    references: {
      model: "RootNotes",
      foreignKey: "id",
      as: "rootnoteId",
    },
  }
}, {
  Sequelize,
  tableName: 'scales',
  modelName: 'Scales',
});

module.exports = Scales;
