const express = require('express');

const router = express.Router();

// Get the main rootnotes page
router.get('/', (req, res) => {
  res.render('rootnotes',  {
    app_title: 'PianoGraph',
    page_description: 'Root Notes',
  });
});

// Get the add rootnotes page
router.get('/add', (req, res) => {
  res.render('add_rootnote',  {
    app_title: 'PianoGraph',
    page_description: 'Add Root Note',
  });
});

module.exports = router;
