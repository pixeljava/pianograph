const express = require('express');
const db = require('../db/server');
const RootNote = require('../db/models/Rootnote');
const Scales = require('../db/models/Scales');

const router = express.Router();

// Render the 'scales' view when accessing <host>/scales/
router.get('/', (req, res) => {
  Scales.findAll()
    .then(scales => {
      console.log(scales);
      res.send(scales);
    })
    .catch(err => console.log(err));
});

module.exports = router;
