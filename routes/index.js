const express = require('express');

const router = express.Router();

// Render the 'index' view when the server base is requested
router.get('/', (req, res) => {
  res.render('index', {
    // Some default data for the page
    title: 'PianoGraph',
    description: 'Find Piano Scales Easily!'
  });
});

module.exports = router;
