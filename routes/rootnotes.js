const express = require('express');
const db = require('../db/server');
const RootNote = require('../db/models/Rootnote');
const Scales = require('../db/models/Scales');

const router = express.Router();

// Get a list of all root notes
// Render the rootnotes view when accessing <host>/scales/
router.get('/', (req, res) => {
  RootNote.findAll()
    .then(rootNotes => {
      console.log(rootNotes);
      res.send(rootNotes);
    })
    .catch(err => console.log(err));
});

// Add a root note to the root_note table
router.get('/add', (req, res) => {
  const data = {
    title: 'C',
    wikiurl: 'https://en.wikipedia.org/wiki/C_(musical_note)',
    wikipageid: '49220',
    binposition: '000000000000100000000000',
    numposition: '2048',
    removable: true
  };

  const { title, wikiurl, wikipageid, binposition, numposition, removable } = data;

  // Insert all fields into the rootnotes table
  RootNote.create({
    title,
    wikiurl,
    wikipageid,
    binposition,
    numposition,
    removable
  })
    // Maybe remove the redirect if using it as an API
    .then((res_rootnote) => res.redirect('/rootnotes'))
    .catch(err => console.log(err));
});

module.exports = router;
