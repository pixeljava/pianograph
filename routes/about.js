const express = require('express');

const router = express.Router();

// Render the 'about' view when the server base is requested
router.get('/', (req, res) => {
  res.render('about', {
    // Some default data for the page
    app_title: 'PianoGraph',
    page_description: 'About Us'
  });
});

module.exports = router;
