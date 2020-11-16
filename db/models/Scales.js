const Sequelize = require('sequelize');
const db = require('../server');

const Scales = db.sequelize.define('scales', {
  title: {
    type: Sequelize.STRING,
    allowNull: false
  },
  wikiurl: {
    type: Sequelize.STRING
  },
  wikipageid: {
    type: Sequelize.INTEGER
  },
  binposition: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true
  },
  numposition: {
    type: Sequelize.INTEGER,
    allowNull: false,
    unique: true
  },
  rootnoteId: {
    type: Sequelize.INTEGER,
    onDelete: "CASCADE",
    references: {
      model: "root_notes",
      key: "id",
      as: "rootnoteId",
    },
  }
}, {
  Sequelize,
  modelName: 'Scales',
});

module.exports = Scales;
