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

  function nothingFound(key) {
    // Remove all keys with .down class
    $('#piano').find('.key').removeClass('down');
    $(key).addClass('down');
    // Empty the content box and add the empty set note
    $('section.boxContent').empty();
    const emptySetTemplate = $(`
    <p class="emptySet center"><i class="fas fa-info-circle"></i> No info found for this note.</p>
    `);
    emptySetTemplate.appendTo('section.boxContent');
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
              <input type="text" id="wikipageid-${noteData.id}" placeholder="Enter Wikipedia page id..."
                      name="wikipageid" value="${noteData.wikipageid}" maxlength="10">
            </div>
            <br />
            <div class="formButtons">
              <button class="saveButton" id="saveNote-${noteData.id}" data-note-id="${noteData.id}" 
                      type="button" title="Save">
                <i class="far fa-save"></i> Save
              </button>
              <button class="cancelButton" id="cancelUpdate-${noteData.id}" data-note-id="${noteData.id}"
                      type="button" title="Cancel">
                <i class="fas fa-times-circle"></i> Cancel
              </button>
              <div class="right">
                <button class="wikiButton" id="getWikiPageId-${noteData.id}" data-note-id="${noteData.id}" 
                        type="button" title="Get Wikipedia Page Id" >
                  <i class="fab fa-wikipedia-w"></i> Get Wiki Page Id
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
      <div class="bottomButtons">
        <button class="viewButton" id="viewNote-${noteData.id}" data-numposition="${noteData.numposition}" title="View Note">
          <i class="fas fa-music"></i> View
        </button>
        <button class="scalesButton" id="viewScales-${noteData.id}" data-rootnote-id="${noteData.id}" title="View Scales">
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
    $('button.closeHelp').off().on('click', function (e) {
      localStorage.setItem('showRootNoteHelp',false);
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
      // Grab everything from the form and serialize it
      let updateForm = $(note).find('div.updateForm form');
      let reqData = $(updateForm).serializeArray();
      // Then pass it to objectifyForm to send it in the right format for the API
      reqData = objectifyForm(reqData);
      doSaveNote(noteId, reqData);
    });
    // The 'Cancel' button grabs a copy of the information from note and repopulates the form.
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
    // Gets Wikipedia Page Ids from Wikipedia URLs
    $(`button#getWikiPageId-${initData.id}`).off().on('click', function (e) {
      const noteId = $(this).data('noteId');
      const note = $(`div#note-${noteId}`);
      const updateForm = $(note).find('div.updateForm form');
      let formUrl = $(updateForm).find('input[name="wikiurl"]').val();
      // We only need the page name from the end of the URL
      let urlPath = new URL(formUrl).pathname;
      let wikiPageName = urlPath.substr(urlPath.lastIndexOf('/') + 1);
      // Any special characters (suprisingly) have to be coverted back to being special for the API
      wikiPageName = decodeURIComponent(wikiPageName);
      doGetWikiPageId(noteId, wikiPageName);
    });

    // Event handlers for noteHolder buttons
    // The 'View' button
    $(`button#viewNote-${initData.id}:button`).off().on('click', function (e) {
      // Remove all keys with .down class
      $('#piano').find('.key').removeClass('down');
      const numPos = $(this).data('numposition');
      var thisNote = $(`div.key[data-numposition="${numPos}"]`);
      thisNote.addClass('down');
    });
    // The 'Scales' button
    $(`button#viewScales-${initData.id}:button`).off().on('click', function (e) {
      // Send the user to scales using a query string.
      const rootnoteId = $(this).data('rootnoteId');
      const sendTo = `${$(location).attr('origin')}/scales/?&rootnote=${rootnoteId}`;
      window.location.href = sendTo;
    });
    // The 'Update' button
    $(`button#update-${initData.id}:button`).off().on('click', function (e) {
      const noteId = $(this).data('noteId');
      const note = $(`div#note-${noteId}`);
      const formHolder = $(note).find('div.updateForm');
      const bottomButtons = $(note).find('div.bottomButtons');
      bottomButtons.toggle();
      formHolder.slideToggle(250);
    });
    // The 'Delete' button (with modal confirmation)
    $(`button#delete-${initData.id}:button`).off().on('click', function (e) {
      const noteId = $(this).data('noteId');
      const note = $(`div#note-${noteId}`);
      // Pass the name of the note to the modal
      const noteTitle = $(note).data('title');
      modal.open({content: $(`
        <h1 id="modalHeader">Confirm Delete</h1>
        <p id="modalText">Are you sure you want to delete root note: <strong>${noteTitle}</strong>?</p>
        <br />
        <p id="modalText"><strong>Deleting this root note will also delete all associated scales!</strong></p>
        <button id="modalConfirm" class="modalButton red" title="Delete ${noteTitle}">
          <i class="fas fa-trash-alt"></i> Delete
        </button>
        <button id="modalCancel" class="modalButton grey right" title="Cancel">
          <i class="fas fa-times-circle"></i> Cancel
        </button>
        `), width: '80vw'});
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
    $('#piano').find('.key').removeClass('down');
    // Then fill it with the results of the AJAX call.
    $.ajax({
      type: 'GET',
      url: xhrGetNotes,
      contentType: 'application/json',
      dataType: 'json',
      success: function(result){
        $.each(result, function(i, data) {
          // Since the note's attributes may have changed, reset the rootnoteId
          var key = $(`div.key[data-numposition="${data.numposition}"]`);
          $(key).attr('data-rootnote-id', data.id);
          // Use the template to construct each note's box
          $(rootNoteTemplate(data)).appendTo('section.boxContent');
          // Initiate the events on the buttons created by the template
          initNoteButtonHandlers(data);
          // Reset any "viewing note {noteTitle)" to default
          const contentBoxHead = $('div.boxHead');
          const contentBoxTitle = $('p.boxTitle');
          const boxHeader = `
            <p class="boxTitle left">Viewing all Root Notes</p>
            <br style="clear: both;" />
          `;
          contentBoxHead.empty();
          $(boxHeader).appendTo(contentBoxHead);
          // Assign click handlers to each piano note
          $(key).off().on('click', function (e) {
            window.doGetOneNoteByNum($(this), data.numposition); 
          });
        });
        // Any keys that haven't been input yet get the empty set template and a matching click handler
        let missingKeys = $('#piano .key').not('div.key[data-rootnote-id]');
        $.each(missingKeys, function(i, key) {
          $(key).off().on('click', function (e) {
            nothingFound(this);
          });
        });
        // If there's absolutely nothing then we add an empty set template
        if (!result.length) {
          $('section.boxContent').empty();
          const emptySetTemplate = $(`
          <p class="emptySet center"><i class="fas fa-info-circle"></i> No notes found!</p>
          `);
          emptySetTemplate.appendTo('section.boxContent');
        }
      }
    });
  }; 

  // GET one root note by a note object and numPos and then update the view.
  window.doGetOneNoteByNum = (thisNote, numPos) => {
    // Remove all keys with .down class...
    $('#piano').find('.key').removeClass('down');
    // ...and then highlight this note.
    thisNote.addClass('down');
    // Clear the content box first
    $('section.boxContent').empty();
    $.ajax({
      type: 'GET',
      url: `${xhrGetNotes}/number/${numPos}`,
      contentType: 'application/json',
      dataType: 'json',
      success: (result) => {
        $.each(result, function(i, data) {
          // Use the template to construct each note's box
          $(rootNoteTemplate(data)).appendTo('section.boxContent');
          // Initiate the events on the buttons created by the template
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
          // Activate the click handler for the reset button
          $(`button#resetView:button`).off().on('click', function (e) {
            doGetNotes();
          });
        });
      }
    });
  };

  // GET one root notes by noteId and then update the view.
  window.doGetOneNoteById = (noteId) => {
    // Remove all keys with .down class
    $('#piano').find('.key').removeClass('down');
    $.ajax({
      type: 'GET',
      url: `${xhrGetNotes}/id/${noteId}`,
      contentType: 'application/json',
      dataType: 'json',
      success: (result) => {
        $('section.boxContent').empty();
        $.each(result, function(i, data) {
          // Use the template to construct each note's box
          $(rootNoteTemplate(data)).appendTo('section.boxContent');
          // Initiate the events on the buttons created by the template
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
          // Activate the click handler for the reset button
          $(`button#resetView:button`).off().on('click', function (e) {
            doGetNotes();
          });
          // Highlight the key that was previously referenced (whether clicked or from a direct URL)
          let thisNote = $(`div.key[data-numposition="${data.numposition}"]`);
          thisNote.addClass('down');
        });
      }
    });
  };

  // DELETE deletes root notes {id} and then update the view.
  const doDeleteNote = (noteId) => {
    // Unset the data-rootnote-id attribute (since we need unset to be properly handled by doGetNotes)
    let thisNote = $(`div.key[data-rootnote-id="${noteId}"]`);
    $(thisNote).removeAttr('data-rootnote-id');
    $.ajax({
      type: 'DELETE',
      url: `${xhrDeleteNote}/${noteId}`,
      contentType: 'application/json',
      dataType: 'json',
      success: function(){
        // Close the modal and grab the changed set of notes
        modal.close();
        doGetNotes();
      }
    });
  };

  // Use Wikipedia's API to find the Page Id from the given URL.
  const doGetWikiPageId = (noteId, wikiPageName) => {
    const note = $(`div#note-${noteId}`);
    const updateForm = $(note).find('div.updateForm form');
    const errorMessages = $(note).find('div.errorMessages');
    $(errorMessages).empty();
    let data = {
      origin: '*',
      action: 'query',
      format: 'json',
      prop: 'pageprops',
      ppprop: 'wikibase_item',
      titles: `${wikiPageName}`
    };
    $.ajax({
      type: 'GET',
      url: 'https://en.wikipedia.org/w/api.php',
      data: data,
      dataType: 'json',
      success: function(result){
        if (!result.query) {
          // If we didn't send anything that the Wikipedia API can search...
          let errorMessage = $(`
          <p><i class="fas fa-exclamation-triangle"></i> An error occured. Did you paste the whole URL?</p>
          `);
          $(errorMessage).appendTo(errorMessages);
          $(errorMessages).show();
        } else {
          // Grab the page id from the response and add it to the form.
          let pageId = Object.keys(result.query.pages)[0];
          $(updateForm).find('input[name="wikipageid"]').val(pageId);
        }
      },
      error: function(result){
        // If the search can't be completed (which, with a valid Wikipedia URL should be impossible)...
        let errorMessage = $(`
        <p><i class="fas fa-exclamation-triangle"></i> An error occured. Did you paste the whole URL?</p>
        `);
        $(errorMessage).appendTo(errorMessages);
      },
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
        // Use the errors returned by the API to populate the error message area
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

  // Run all of the code that should execute automatically when the page loads.
  const readySetLoad = () => {
    const pageHelp = $('section.pageHelp');
    // Get the localStorage value of showRootNoteHelp to see if the help should remain hidden.
    // Of course only strings can be stored in localStorage right now, so the logic looks bad...
    // ...or there's a better way to write it. Either/or.
    let showHelp = localStorage.getItem('showRootNoteHelp');
    if (showHelp === null) {
      localStorage.setItem('showRootNoteHelp',true);
      pageHelp.show();
    } else if (showHelp === 'true') {
      pageHelp.show();
    } else if (showHelp === 'false') {
      pageHelp.hide();
    }    

    if (requestedRootNoteId > 0) { // If a specific note was passed as a query in the URL...
      doGetOneNoteById(requestedRootNoteId);
    } else {
      doGetNotes(); // ...or just run this automatically once the document is ready...
    }    
  };
  readySetLoad();
});
