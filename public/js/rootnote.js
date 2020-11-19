$( document ).ready(function() {
  const xhrGetNotes = '/api/rootnotes'; // GET all root notes
  const xhrUpdateNote = '/api/rootnotes/update'; // PUT note {id}
  const xhrDeleteNote = '/api/rootnotes/remove'; // DELETE note {id}

  function objectifyForm(formArray) {
    // Fix for POST/PUT
    var returnArray = {};
    for (var i = 0; i < formArray.length; i++){
        returnArray[formArray[i]['name']] = formArray[i]['value'];
    }
    return returnArray;
  }

  let rootNoteTemplate = (noteData) => `
    <div id="note-${noteData.id}" class="noteHolder" data-id="${noteData.id}" data-title="${noteData.title}"
          data-wikiurl="${noteData.wikiurl}" data-wikipageid="${noteData.wikipageid}"
          data-binposition="${noteData.binposition}" data-numposition="${noteData.numposition}">
      <h1 class="noteTitle">Note: ${noteData.title}</h1>
      <div class="noteInfo">
        <p><strong>Wikipedia URL: </strong><a target="_blank" href="${noteData.wikiurl}">${noteData.wikiurl}</a></p>
        <p><strong>Wikipedia PageId: </strong>${noteData.wikipageid}</p>
        <p><strong>PianoGraph: </strong>${noteData.binposition} (${noteData.numposition})</p>
      </div>
      <section class="formHolder">
        <div class="errorMessages"></div>
        <div class="updateForm">
          <form>
            <div class="formInput">
              <label for="title">Note Name:</label>
              <input type="text" id="title-${noteData.id}" placeholder="Enter note name..."
                      name="title" value="${noteData.title}" maxlength="5" required>
            </div>
            <br />
            <div class="formInput">
              <label for="binposition">Binary Representation:</label>
              <input type="text" id="binposition-${noteData.id}" placeholder="Enter binary..."
                      name="binposition" value="${noteData.binposition}" maxlength="24" required>
            </div>
            <br />
            <div class="formInput">
              <label for="numposition">Numerical Representation:</label>
              <input type="text" id="numposition-${noteData.id}" placeholder="Enter number..."
                      name="numposition" value="${noteData.numposition}" maxlength="7" required>
            </div>
            <br />
            <div class="formInput">
              <label for="wikiurl">Wikipedia Link:</label>
              <input type="text" id="wikiurl-${noteData.id}" placeholder="Enter URL..."
                      name="wikiurl" value="${noteData.wikiurl}" maxlength="100" required>
            </div>
            <br />
            <div class="formInput">
              <label for="wikipageid">Wikipedia Page Id:</label>
              <input type="text" id="wikipageid-${noteData.id}" placeholder="Enter id..."
                      name="wikipageid" value="${noteData.wikipageid}" maxlength="10">
            </div>
            <br />
            <button class="saveButton" id="saveNote-${noteData.id}" data-note-id="${noteData.id}" 
                    type="button" title="Save"><i class="far fa-save"></i> Save</button>
            <button class="cancelButton" id="cancelUpdate-${noteData.id}" data-note-id="${noteData.id}"
                    type="button" title="Cancel"><i class="fas fa-times-circle"></i> Cancel</button>
          </form>
        </div>
      </section>
      <div class="bottomButtons">
        <button class="viewButton" id="viewNote-${noteData.id}" data-numposition="${noteData.numposition}" title="View Note">
          <i class="fas fa-music"></i> View
        </button>
        <button class="scalesButton" id="viewScales-${noteData.id}" data-note-id="${noteData.id}" title="View Scales">
          <i class="fas fa-list-ul"></i> Scales
        </button>
        <div class="right">
          <button class="updateButton" id="update-${noteData.id}" data-note-id="${noteData.id}" title="Update Note">
            <i class="fas fa-pencil-alt"></i> Update
          </button>
          <button class="deleteButton" id="delete-${noteData.id}" data-note-id="${noteData.id}" title="Delete Note">
            <i class="fas fa-trash-alt"></i> Delete
          </button>
        </div>
      </div>
    </div>
  `;
  
  // initData contains a copy of the response model from a GET operation.
  const initNoteButtonHandlers = (initData) => {
    // Help Close Button
    $('div.closeHelp').off().on('click', function (e) {
      localStorage.setItem('showHelp',false);
      const pageHelp = $('section.pageHelp');
      pageHelp.hide();
    });
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
      const formHolder = $(note).find('div.updateForm');
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
      formHolder.slideToggle(250);
    });

    // Event handlers for noteHolder buttons
    $(`button#viewNote-${initData.id}:button`).off().on('click', function (e) {
      // Remove all keys with .down class
      const piano = $('#piano');
      $(piano).find('.key').removeClass('down');
      const numPos = $(this).data('numposition');
      console.log('numPos: ', numPos);
      var thisNote = $(`div.key[data-numposition="${numPos}"]`);
      console.log('thisNote: ', thisNote);
      thisNote.addClass('down');
    });

    $(`button#viewScales-${initData.id}:button`).off().on('click', function (e) {
      console.log(e);
    });
    $(`button#update-${initData.id}:button`).off().on('click', function (e) {
      const noteId = $(this).data('noteId');
      const note = $(`div#note-${noteId}`);
      const formHolder = $(note).find('div.updateForm');
      const bottomButtons = $(note).find('div.bottomButtons');
      bottomButtons.toggle();
      formHolder.slideToggle(250);
    });
    $(`button#delete-${initData.id}:button`).off().on('click', function (e) {
      const noteId = $(this).data('noteId');
      const note = $(`div#note-${noteId}`);
      const noteTitle = $(note).data('title');
      modal.open({content: $(`
        <h1 id="modalHeader">Confirm Delete</h1>
        <p id="modalText">Are you sure you want to delete root note: <strong>${noteTitle}</strong>?</p>
        <button id="modalConfirm" class="modalButton red" title="Delete ${noteTitle}">
          <i class="fas fa-trash-alt"></i> Delete
        </button>
        <button id="modalCancel" class="modalButton grey right" title="Cancel">
          <i class="fas fa-times-circle"></i> Cancel
        </button>
        `), width: 'max(80vw, 300px)'});
      // Set event listeners to the modal buttons
      $(`button#modalConfirm:button`).off().on('click', function (e) {
        doDeleteNote(noteId);
      });
      $(`button#modalCancel:button`).off().on('click', function (e) {
        modal.close();
      });
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
        $.each(result, function(i, data) {
          $(rootNoteTemplate(data)).appendTo('section.boxContent');
          initNoteButtonHandlers(data);
        });
      }
    });
  }; 

  // GET one root notes and then update with view.
  window.doGetOneNote = (thisNote, numPos) => {
    // Remove all keys with .down class
    $('#piano').find('.key').removeClass('down');
    thisNote.addClass('down');
    // Clear the content box first
    $('section.boxContent').empty();
    $.ajax({
      type: 'GET',
      url: `${xhrGetNotes}/${numPos}`,
      contentType: 'application/json',
      dataType: 'json',
      success: (result) => {
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
      },
      error: (result) => {
        console.log('Result Failure:', result);
      }
    });
  };

  // DELETE deletes root notes {id} and then update the view.
  const doDeleteNote = (noteId) => {
    $.ajax({
      type: 'DELETE',
      url: `${xhrDeleteNote}/${noteId}`,
      contentType: 'application/json',
      dataType: 'json',
      success: function(){
        modal.close();
        doGetNotes();
      }
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

  const doViewScales = (e, id) => {
    console.log('e:', e);
  };

  const initPiano = () => {
    const piano = $('div#piano');
    const allKeys = $(piano).find('.key');
    //console.log('Piano keys: ', allKeys);
    $.each(allKeys, function(i, key) {
      //console.log('key this: ', key);
      let keyNumPos = $(key).data('numposition');
      $(key).off().on('click', function (e) {
        window.doGetOneNote($(this), keyNumPos); 
      });
    });
  };

  // Run all of the code that should execute automatically when the page loads.
  const readySetLoad = () => {
    const pageHelp = $('section.pageHelp');
    // Get the localStorage value of showHelp to see if the help should remain hidden.
    // Of course only strings can be stored in localStorage right now, so the logic looks bad...
    // ...or there's a better way to write it. Either/or.
    let showHelp = localStorage.getItem('showHelp');
    if (showHelp === null) {
      console.log(`null: ${showHelp}`);
      localStorage.setItem('showHelp',true);
      pageHelp.show();
    } else if (showHelp === 'true') {
      console.log(`true: ${showHelp}`);
      pageHelp.show();
    } else if (showHelp === 'false') {
      console.log(`false: ${showHelp}`);
      pageHelp.hide();
    }    
    initPiano(); // Set click handlers to each piano key.
    doGetNotes(); // Just run this automatically once the document is ready...
  };
  readySetLoad();


});