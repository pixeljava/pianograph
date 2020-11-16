const express = require('express');
const db = require('../db/server');
const RootNote = require('../db/models/Rootnote');

const router = express.Router();

// GET /api/rootnotes/
// GET a list of all root notes when accessing <host>/api/rootnotes/
router.get('/', (req, res) => {
  RootNote.findAll()
    .then(rootnotes => {
      res.status(201).send(rootnotes);
    })
    .catch(e => {
      console.log(e);
      res.status(500).send(e);
    });
});

// Add a root note to the root_note table
router.get('/add', (req, res) => {
  let { title, wikiurl, wikipageid, binposition, numposition } = req.body;
  let errors = {};

  if(!title) {
    errors.title = { text: 'Please add a title' };
  }
  if(!wikiurl) {
    errors.wikiurl = { text: 'Please add a Wikipedia URL for this note' };
  }
  if(!binposition) {
    errors.binposition = { text: 'Please add PianoGraph binary position' };
  }
  if(!numposition) {
    errors.numposition = { text: 'Please add PianoGraph numeric position' };
  }

  if(Object.keys(errors).length > 0) {
    res.status(500).send({
      errors,
      title, 
      wikiurl, 
      wikipageid, 
      binposition, 
      numposition
    });
  } else {
  // Insert all fields into the rootnotes table
  RootNote.create({
    title,
    wikiurl,
    wikipageid,
    binposition,
    numposition
  })
  .catch(e => {
    console.log(e);
    res.status(500).send(
      e,
      errors,
      title, 
      wikiurl, 
      wikipageid, 
      binposition, 
      numposition
    );
  });
  }

});

module.exports = router;
