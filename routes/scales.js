const express = require('express');

const router = express.Router();

// Putting this keeps it from interferring with /scales/ routing
router.get('/', (req, res) => {
  let rootnoteId = req.query.rootnote;
  if (isNaN(req.query.rootnote)) {
    rootnoteId = 0;
  } else {
    rootnoteId = req.query.rootnote;
  }
  res.render('scales',  {
    app_title: 'PianoGraph',
    page_description: 'Scales',
    root_note_in: rootnoteId
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
