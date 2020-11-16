const express = require('express');

const router = express.Router();

// Get the main scales page
router.get('/', (req, res) => {
  res.render('scales',  {
    app_title: 'PianoGraph',
    page_description: 'Root Notes',
  });
});

// Get the add scales page
router.get('/add', (req, res) => {
  res.render('add_scale',  {
    app_title: 'PianoGraph',
    page_description: 'Add a Scale',
  });
});

module.exports = router;
