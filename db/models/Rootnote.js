const Sequelize = require('sequelize');
const db = require('../server');

const RootNote = db.sequelize.define('root_notes', {
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
  modelName: 'RootNote',
});

module.exports = RootNote;
