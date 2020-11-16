const express = require('express');
const RootNote = require('../db/models/Rootnote');

const router = express.Router();

router.delete('/user', function (req, res) {
  res.send('Got a DELETE request at /user');
});

// GET /api/rootnotes/
// GET a list of all root notes when accessing <host>/api/rootnotes/
router.get('/', (req, res) => {
  RootNote.findAll()
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

  if(Object.keys(errors).length > 0) {
    res.status(500).send({
      errors,
      title: request.title,
      wikiurl: request.wikiurl,
      wikipageid: request.wikipageid,
      binposition: request.binposition,
      numposition: request.numposition
    });
  } else {
    RootNote.create({
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

// PUT /api/rootnotes/add
// PUT an updated root note {id} with: title, wikiurl, binposition, numposition
router.put('/update/:noteId', (req, res) => {
  let errors = {};
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

  if(Object.keys(errors).length > 0) {
    res.status(500).send({
      errors,
      title: request.title,
      wikiurl: request.wikiurl,
      wikipageid: request.wikipageid,
      binposition: request.binposition,
      numposition: request.numposition
    });
  } else {
    RootNote.update({
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

  RootNote.destroy({
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
