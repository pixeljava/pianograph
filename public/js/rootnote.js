$( document ).ready(function() {
  const xhrAddNote = '/api/rootnotes/add/'; // POST a new note
  const xhrGetNotes = '/api/rootnotes/'; // GET all root notes
  const xhrUpdateNote = '/api/rootnotes/update'; // PUT note {id}
  const xhrDeleteNote = '/api/rootnotes/remove'; // DELETE note {id}

  const updateNote = (id) => {
    console.log(`Not quite updating id [${id}] yet...`);
  };
  const deleteNote = (id) => {
    console.log(`Not quite deleting id [${id}] yet...`);
  };
  
  // GET all root notes and then update with view.
  const doGetNotes = () => {
    $('section.boxContent').empty();

    $.ajax({
      type: 'GET',
      url: xhrGetNotes,
      contentType: 'application/json',
      dataType: 'json',
      success: function(result){
        $.each(result, function(i, data) {
          var rootNote = $(`
            <div class="noteHolder">
              <p>Note: ${this.title}</p>
              <p>Wikipedia URL: <a href="${this.wikiurl}">${this.wikiurl}</a></p>
              <p>Wikipedia PageId: ${this.wikipageid}</p>
              <p>PianoGraph: ${this.binposition} (${this.numposition})</p>
              <button id="update-${this.id}" data-object-id="${this.id}" title="Update Note">Update</button>
              <button id="delete-${this.id}" data-object-id="${this.id}" title="Delete Note">Delete</button>
            </div>`);
          $(document).off().on('click', `#update-${this.id}`, function(e) {
            e.preventDefault();
            updateNote(data.id);
          });
          $(document).off().on('click', `#delete-${this.id}`, function(e) {
            e.preventDefault();
            doDeleteNote(e, data.id);
          });
          $(rootNote).appendTo('section.boxContent');
        });        
      }
    });
  }; 
  doGetNotes(); // Just run this automatically once the document is ready...

  // DELETE root notes {id} and then update the view.
  const doDeleteNote = (e, id) => {
    console.log('e:', e);
    $.ajax({
      type: 'DELETE',
      url: `${xhrDeleteNote}/${id}`,
      contentType: 'application/json',
      dataType: 'json',
      success: function(result){
        doGetNotes();
      }
    });
  };

});