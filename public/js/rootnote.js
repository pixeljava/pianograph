$( document ).ready(function() {
  const xhrAddNote = '/api/rootnotes/add/'; // POST a new note
  const xhrGetNotes = '/api/rootnotes/'; // GET all root notes
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
  
  // GET all root notes and then update with view.
  const doGetNotes = () => {
    // Clear the content box first
    $('section.boxContent').empty();
    // Then fill it with the results of the AJAX call.
    $.ajax({
      type: 'GET',
      url: xhrGetNotes,
      contentType: 'application/json',
      dataType: 'json',
      success: function(result){
        $.each(result, function(i, data) {
          var rootNote = $(`
            <div class="noteHolder"
                 data-note-id="${this.id}" data-note-title="${this.title}"
                 data-note-wikipageid="${this.wikipageid}" data-note-binposition="${this.binposition}">
              <h1 class="noteTitle">Note: ${this.title}</h1>
              <div class="noteInfo">
                <p><strong>Wikipedia URL: </strong><a target="_blank" href="${this.wikiurl}">${this.wikiurl}</a></p>
                <p><strong>Wikipedia PageId: </strong>${this.wikipageid}</p>
                <p><strong>PianoGraph: </strong>${this.binposition} (${this.numposition})</p>
              </div>
              <div class="updateForm">
                <div class="errorMessages">
                  <p>This is an error message!</p>
                  <p>This is an error message!</p>
                  <p>This is an error message!</p>
                  <p>This is an error message!</p>
                </div>
                <div class="formHolder">
                  <form>
                    <div class="formInput">
                      <label for="title">Note Name:</label>
                      <input type="text" id="title-${this.id}" placeholder="Enter note name..."
                             name="title" value="${this.title}">
                    </div>
                    <br />
                    <div class="formInput">
                      <label for="binposition">Binary Representation:</label>
                      <input type="text" id="binposition-${this.id}" placeholder="Enter binary..."
                             name="binposition" value="${this.binposition}">
                    </div>
                    <br />
                    <div class="formInput">
                      <label for="numposition">Numerical Representation:</label>
                      <input type="text" id="numposition-${this.id}" placeholder="Enter number..."
                             name="numposition" value="${this.numposition}">
                    </div>
                    <br />
                    <div class="formInput">
                      <label for="wikiurl">Wikipedia Link:</label>
                      <input type="text" id="wikiurl-${this.id}" placeholder="Enter URL..."
                             name="wikiurl" value="${this.wikiurl}">
                    </div>
                    <br />
                    <div class="formInput">
                      <label for="wikipageid">Wikipedia Page Id:</label>
                      <input type="text" id="wikipageid-${this.id}" placeholder="Enter id..."
                             name="wikipageid" value="${this.wikipageid}">
                    </div>
                    <br />
                    <button class="saveButton" id="saveNote-${this.id}" 
                            type="button"><i class="far fa-save"></i> Save</button>
                    <button class="cancelButton" id="cancelUpdate-${this.id}"
                            type="button"><i class="fas fa-times-circle"></i> Cancel</button>
                  </form>
                </div>
              </div>
              <div class="bottomButtons">
                <button class="viewButton" id="viewNote-${this.id}" title="View Note">
                  <i class="fas fa-music"></i> View
                </button>
                <button class="scalesButton" id="viewScales-${this.id}" title="View Scales">
                  <i class="fas fa-list-ul"></i> Scales
                </button>
                <div class="right">
                  <button class="updateButton" id="update-${this.id}" title="Update Note">
                    <i class="fas fa-pencil-alt"></i> Update
                  </button>
                  <button class="deleteButton" id="delete-${this.id}" title="Delete Note">
                    <i class="fas fa-trash-alt"></i> Delete
                  </button>
                </div>
              </div>
            </div>
          `);

          $(rootNote).appendTo('section.boxContent');
          // Event handlers for the updateForm 
          $(`button#saveNote-${this.id}:button`).off().on('click', function (e) {
            let note = $(this).closest('div.noteHolder');
            let noteId = $(note).data('noteId');
            let updateForm = $(note).find('div.updateForm form');
            let data = $(updateForm).serializeArray();
            data = objectifyForm(data);

            doSaveNote(noteId, data);
          });
          $(`button#cancelUpdate-${this.id}:button`).off().on('click', function (e) {
            let note = $(this).closest('div.noteHolder');
            let updateForm = $(note).find('div.updateForm');
            let bottomButtons = $(note).find('div.bottomButtons');
            bottomButtons.toggle();
            updateForm.slideToggle(250);
          });

          $(`button#viewNote-${this.id}:button`).off().on('click', function (e) {
            //doViewNote(data.id);
          });
          $(`button#viewScales-${this.id}:button`).off().on('click', function (e) {
            //doViewScales(data.id);
          });
          $(`button#update-${this.id}:button`).off().on('click', function (e) {
            let note = $(this).closest('div.noteHolder');
            let updateForm = $(note).find('div.updateForm');
            let bottomButtons = $(note).find('div.bottomButtons');
            bottomButtons.toggle();
            updateForm.slideToggle(250);
          });
          $(`button#delete-${this.id}:button`).off().on('click', function (e) {
            let note = $(this).closest('div.noteHolder');
            let noteTitle = $(note).data('noteTitle');
            let noteId = $(note).data('noteId');
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
            // Set event listeners to the buttons
            $(`button#modalConfirm:button`).off().on('click', function (e) {
              doDeleteNote(noteId);
            });
            $(`button#modalCancel:button`).off().on('click', function (e) {
              modal.close();
            });
            // Move this behind a modal confirmation.
          });

        }); // End each()
      }
    });
  }; 
  doGetNotes(); // Just run this automatically once the document is ready...



  // DELETE deletes root notes {id} and then update the view.
  const doDeleteNote = (noteId) => {
    console.log(`id: ${noteId}`);
    $.ajax({
      type: 'DELETE',
      url: `${xhrDeleteNote}/${noteId}`,
      contentType: 'application/json',
      dataType: 'json',
      success: function(result){
        modal.close();
        doGetNotes();
      }
    });
  };

  // PUT updates root notes {id} and then update the view.
  const doSaveNote = (noteId, updateData) => {
    console.log(`noteId: ${noteId}`);
    console.log('updateData: ', updateData);
    $.ajax({
      type: 'PUT',
      url: `${xhrUpdateNote}/${noteId}`,
      contentType: 'application/x-www-form-urlencoded',
      data: updateData,
      success: function(result){
        doGetNotes();
      }
    });
  };
  const doViewNote = (e, id) => {
    console.log('e:', e);
  };
  const doViewScales = (e, id) => {
    console.log('e:', e);
  };

});