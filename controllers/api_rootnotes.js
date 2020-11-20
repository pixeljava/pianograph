const express = require('express');
const RootNotes = require('../db/models/RootNotes');

const router = express.Router();

// GET /api/rootnotes/
// GET a list of all root notes when accessing <host>/api/rootnotes/
router.get('/', (req, res) => {
  RootNotes.findAll()
    .then(rootnotes => {
      res.status(200).json(rootnotes);
    })
    .catch(e => {
      console.log(e);
      res.status(500).json(e);
    });
});

// GET /api/rootnotes/number/{numposition}
// GET a list of a root note matching {numposition}
router.get('/number/:noteNumposition', (req, res) => {
  RootNotes.findAll({
    where: {numposition: req.params.noteNumposition}
  })
    .then(rootnotes => {
      res.status(200).json(rootnotes);
    })
    .catch(e => {
      console.log(e);
      res.status(500).json(e);
    });
});

// GET /api/rootnotes/id/{noteId}
// GET a list of a root note matching {noteId}
router.get('/id/:noteId', (req, res) => {
  RootNotes.findAll({
    where: {id: req.params.noteId}
  })
    .then(rootnotes => {
      res.status(200).json(rootnotes);
    })
    .catch(e => {
      console.log(e);
      res.status(500).json(e);
    });
});

// POST /api/rootnotes/add
// POST a new root note with: title, wikiurl, binposition, numposition
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

  if(Object.keys(errors.fields).length > 0) {
    res.status(500).send({
      errors,
      title: request.title,
      wikiurl: request.wikiurl,
      wikipageid: request.wikipageid,
      binposition: request.binposition,
      numposition: request.numposition
    });
  } else {
    RootNotes.create({
      title: request.title,
      wikiurl: request.wikiurl,
      wikipageid: request.wikipageid,
      binposition: request.binposition,
      numposition: request.numposition
    })
    .then(returnModel => {
      res.status(201).send(returnModel);
    })
    .catch(e => {
      res.status(500).send(e);
    });
  }
});

// PUT /api/rootnotes/update
// PUT an updated root note {id} with: title, wikiurl, binposition, numposition
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

  if(Object.keys(errors.fields).length > 0) {
    console.log('Errors were detected, not sending.');
    res.status(500).send({
      errors,
      title: request.title,
      wikiurl: request.wikiurl,
      wikipageid: request.wikipageid,
      binposition: request.binposition,
      numposition: request.numposition
    });
  } else {
    RootNotes.update({
      title: request.title,
      wikiurl: request.wikiurl,
      wikipageid: request.wikipageid,
      binposition: request.binposition,
      numposition: request.numposition
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

// DELETE /api/rootnotes/remove/{noteId}
// DELETE a root note {id}
router.delete('/remove/:noteId', (req, res) => {
  let errors = {};
  let request = req.body;

  RootNotes.destroy({
    where: {id: req.params.noteId}
  })
  .then((num) => {
    if(num === 1) {
      console.log('num',num);
      res.send({
        message: "Note was deleted successfully!"
      });
    } else {
      res.send({
        message: "Note was not deleted. Try refreshing the page and trying again."
      });
    }
  })
  .catch(e => {
    console.log('e',e);
    res.status(500).send(e);
  });

});

module.exports = router;
