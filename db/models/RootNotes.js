const Sequelize = require('sequelize');
const db = require('../server');

const RootNotes = db.sequelize.define('RootNotes', {
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
  }
}, {
  Sequelize,
  tableName: 'root_notes',
  modelName: 'RootNotes'
});

module.exports = RootNotes;
