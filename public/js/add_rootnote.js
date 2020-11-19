$( document ).ready(function() {
  const xhrAddNote = '/api/rootnotes/add'; // POST a new note
  const xhrGetNotes = '/api/rootnotes'; // GET all root notes

  function objectifyForm(formArray) {
    // Fix for POST/PUT
    var returnArray = {};
    for (var i = 0; i < formArray.length; i++){
        returnArray[formArray[i]['name']] = formArray[i]['value'];
    }
    return returnArray;
  }
  
  // initData contains a copy of the response model from a GET operation.
  const initNoteButtonHandlers = (initData) => {
    // Event handlers for the updateForm buttons
    $(`button#saveNote-${initData.id}:button`).off().on('click', function (e) {
      const noteId = $(this).data('noteId');
      const note = $(`div#note-${noteId}`);
      const errorMessages = $(note).find('div.errorMessages');
      // Flush any error messages, hide the error message area
      errorMessages.empty();
      errorMessages.hide();

      let updateForm = $(note).find('div.updateForm form');
      let reqData = $(updateForm).serializeArray();
      reqData = objectifyForm(reqData);

      doSaveNote(noteId, reqData);
    });
    $(`button#cancelUpdate-${initData.id}:button`).off().on('click', function (e) {
      const noteId = $(this).data('noteId');
      const note = $(`div#note-${noteId}`);
      const errorMessages = $(note).find('div.errorMessages');
      const bottomButtons = $(note).find('div.bottomButtons');
      const updateFormHolder = $(note).find('div.updateForm');
      const updateForm = $(note).find('div.updateForm form');
      const inputFields = $(updateForm).find(':input');
      // Grab all data attributes from note to reset the form
      const noteData = note.data();
      // For each input find the input named X in the form and set it to the value of X from noteData.
      $.each(inputFields, function(i, data) {
          $(updateForm).find(`input[name="${data.name}"]`).val(noteData[data.name]);
      });
      // Flush any error messages, hide the error message area
      errorMessages.empty();
      errorMessages.hide();
      // Show the bottom buttons, hide the form
      bottomButtons.toggle();
      updateFormHolder.slideToggle(250);
    });

  };

  // GET all root notes and then update with view.
  const doGetNotes = () => {
    // Clear the content box first
    $('section.boxContent').empty();
    // Remove all keys with .down class
    const piano = $('#piano');
    $(piano).find('.key').removeClass('down');
    // Then fill it with the results of the AJAX call.
    $.ajax({
      type: 'GET',
      url: xhrGetNotes,
      contentType: 'application/json',
      dataType: 'json',
      success: function(result){
        console.log('doGetNotes result: ', result);
        window.rootNoteData = result;
        console.log('Global doGetNotes result: ', window.rootNoteData);
        $.each(result, function(i, data) {
          // This should now light up keys for every numposition found in the result
        });
      }
    });
  }; 

  // GET one root notes and then update with view.
  window.doGetOneNote = (thisNote, numPos) => {
    // This should now check whether or not there is a note in the doGetNotes result
    // If so, do nothing. If not, add the numposition and title, calc binposition
    //   and populate the form. If I get time, getting a Wikipedia id from a page URL.


    // Remove all keys with .down class
    $('#piano').find('.key').removeClass('down');
    thisNote.addClass('down');
    // Clear the content box first
    $('section.boxContent').empty();
    $.each(result, function(i, data) {
      $(rootNoteTemplate(data)).appendTo('section.boxContent');
      initNoteButtonHandlers(data);
      // Change "view all root notes" to "viewing root note {title)"
      const contentBoxHead = $('div.boxHead');
      const contentBoxTitle = $('p.boxTitle');
      const boxHeader = `
        <p class="boxTitle left">Viewing Root Note: ${data.title}</p>
        <button id="resetView" class="titleReset right"><i class="fas fa-history"></i> See All Notes</button>
        <br style="clear: both;" />
      `;
      contentBoxHead.empty();
      $(boxHeader).appendTo(contentBoxHead);
      $(`button#resetView:button`).off().on('click', function (e) {
        doGetNotes();
      });
    });
  };

  // PUT updates root notes {id} and then update the view.
  const doSaveNote = (noteId, updateData) => {
    const note = $(`div#note-${noteId}`);
    const errorMessages = $(note).find('div.errorMessages');
    $.ajax({
      type: 'PUT',
      url: `${xhrUpdateNote}/${noteId}`,
      contentType: 'application/x-www-form-urlencoded',
      data: updateData,
      dataType: 'json',
      success: function () {
        doGetNotes();
      },
      error: function (result) {
        result = result.responseJSON;
        if(Object.keys(result.errors).length > 0) {
          $.each(result.errors.fields, function(i, data) {
            let errorMessage = $(`
              <p><i class="fas fa-exclamation-triangle"></i> ${data}</p>
            `);
            $(errorMessage).appendTo(errorMessages);
          });
          errorMessages.show();
        }
      }
    });
  };

  const initPiano = () => {
    const piano = $('div#piano');
    const allKeys = $(piano).find('.key');
    $.each(allKeys, function(i, key) {
      let keyNumPos = $(key).data('numposition');
      $(key).off().on('click', function (e) {
        window.doGetOneNote($(this), keyNumPos); 
      });
    });
  };

  // Run all of the code that should execute automatically when the page loads.
  const readySetLoad = () => {
    initPiano(); // Set click handlers to each piano key.
    doGetNotes(); // Just run this automatically once the document is ready...
  };
  readySetLoad();


});