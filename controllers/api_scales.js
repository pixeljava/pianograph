const express = require('express');
const Scales = require('../db/models/Scales');

const router = express.Router();

// GET /api/scales/
// GET a list of all root notes when accessing <host>/api/scales/
router.get('/', (req, res) => {
  Scales.findAll()
    .then(scales => {
      res.status(200).json(scales);
    })
    .catch(e => {
      console.log(e);
      res.status(500).json(e);
    });
});

// GET /api/scales/{rootNoteId}
// GET a list of a root note matching {numposition} <host>/api/rootnotes/
router.get('/id/:rootNoteId', (req, res) => {
  Scales.findAll({
    where: {rootnoteId: req.params.rootNoteId}
  })
    .then(rootnotes => {
      res.status(200).json(rootnotes);
    })
    .catch(e => {
      console.log(e);
      res.status(500).json(e);
    });
});

// POST /api/scales/add
// POST a new scale with: title, wikiurl, binposition, numposition, rootnoteId
router.post('/add', (req, res) => {
  let errors = {};
  errors.fields = {};
  let request = req.body;

  if(!request.title) {
    errors.fields.title = 'Please add a title';
  }
  if(!request.wikiurl) {
    errors.fields.wikiurl = 'Please add a Wikipedia URL for this note';
  }
  if(!request.binposition) {
    errors.fields.binposition = 'Please add PianoGraph binary position';
  }
  if(!request.numposition) {
    errors.fields.numposition = 'Please add PianoGraph numeric position';
  }
  if(!request.rootnoteId) {
    errors.fields.rootnoteId = 'Please the root note id for the corresponding root note';
  }

  if(Object.keys(errors.fields).length > 0) {
    res.status(500).send({
      errors,
      title: request.title,
      wikiurl: request.wikiurl,
      wikipageid: request.wikipageid,
      binposition: request.binposition,
      numposition: request.numposition,
      rootnoteId: request.rootnoteId
    });
  } else {
    Scales.create({
      title: request.title,
      wikiurl: request.wikiurl,
      wikipageid: request.wikipageid,
      binposition: request.binposition,
      numposition: request.numposition,
      rootnoteId: request.rootnoteId
    })
    .then(returnModel => {
      res.status(201).send(returnModel);
    })
    .catch(e => {
      res.status(500).send(e);
    });
  }
});

// PUT /api/scales/update
// PUT an updated scale {id} with: title, wikiurl, binposition, numposition, rootnoteId
router.put('/update/:noteId', (req, res) => {
  let errors = {};
  errors.fields = {};
  let request = req.body;

  if(!request.title) {
    errors.fields.title = 'Please add a title';
  }
  if(!request.wikiurl) {
    errors.fields.wikiurl = 'Please add a Wikipedia URL for this note';
  }
  if(!request.binposition) {
    errors.fields.binposition = 'Please add PianoGraph binary position';
  }
  if(!request.numposition) {
    errors.fields.numposition = 'Please add PianoGraph numeric position';
  }
  if(!request.rootnoteId) {
    errors.fields.rootnoteId = 'Please the root note id for the corresponding root note';
  }
  
  if(Object.keys(errors.fields).length > 0) {
    console.log('Errors were detected, not sending.');
    res.status(500).send({
      errors,
      title: request.title,
      wikiurl: request.wikiurl,
      wikipageid: request.wikipageid,
      binposition: request.binposition,
      numposition: request.numposition,
      rootnoteId: request.rootnoteId
    });
  } else {
    Scales.update({
      title: request.title,
      wikiurl: request.wikiurl,
      wikipageid: request.wikipageid,
      binposition: request.binposition,
      numposition: request.numposition,
      rootnoteId: request.rootnoteId
    }, {
      where: {id: req.params.noteId},
      returning: true
    })
    .then(function ([ rowsUpdated, [returnUpdateModel] ]) {
        res.status(202).send(returnUpdateModel);
      })
    .catch(e => {
      res.status(500).send(e);
    });
  }
});

// DELETE /api/scales/remove/{scaleId}
// DELETE a scale {id}
router.delete('/remove/:scaleId', (req, res) => {
  let errors = {};
  let request = req.body;

  Scales.destroy({
    where: {id: req.params.scaleId}
  })
  .then((num) => {
    if(num === 1) {
      console.log('num',num);
      res.send({
        message: "Scale was deleted successfully!"
      });
    } else {
      res.send({
        message: "Scale was not deleted. Try refreshing the page and trying again."
      });
    }
  })
  .catch(e => {
    console.log('e',e);
    res.status(500).send(e);
  });

});

module.exports = router;
