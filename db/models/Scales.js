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
  removable: {
    type: Sequelize.BOOLEAN,
    allowNull: false
  }
}, {
  Sequelize,
  modelName: 'Scales',
});

module.exports = Scales;
