$( document ).ready(function() {
  const xhrGetNotes = '/api/rootnotes'; // GET all root notes
  const xhrAddNote = '/api/rootnotes/add'; // POST root note

  function objectifyForm(formArray) {
    // Fix for POST/PUT
    var returnArray = {};
    for (var i = 0; i < formArray.length; i++){
        returnArray[formArray[i]['name']] = formArray[i]['value'];
    }
    return returnArray;
  }

  const initNoteButtonHandlers = () => {
    // Help Close Button
    $('button.closeHelp').off().on('click', function (e) {
      localStorage.setItem('showAddRootNoteHelp',false);
      const pageHelp = $('section.pageHelp');
      pageHelp.hide();
    });
    // Event handlers for the addForm buttons
    $(`button#saveNote:button`).off().on('click', function (e) {
      // Flush any error messages, hide the error message area
      $('div.errorMessages').empty();
      $('div.errorMessages').hide();
      // Grab form data and pass it through objectifyForm
      let reqData = $('div.addForm form').serializeArray();
      reqData = objectifyForm(reqData);
      // Now that the data is in the right form we can submit it.
      doSaveNote(reqData);
    });
    $('button#resetNote').off().on('click', function (e) {
      // Reset the form...
      $('div.addForm form').find(':input').val('');
      // Flush any error messages, hide the error message area
      $('div.errorMessages').empty();
      $('div.errorMessages').hide();
    });
    $('button#getWikiPageId').off().on('click', function (e) {
      let formUrl = $('div.addForm form').find('input[name="wikiurl"]').val();
      let urlPath = new URL(formUrl).pathname;
      let wikiPageName = urlPath.substr(urlPath.lastIndexOf('/') + 1);
      wikiPageName = decodeURIComponent(wikiPageName);
      doGetWikiPageId(wikiPageName);
    });
  };

  // GET all root notes and then update with view.
  const doGetNotes = () => {
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
          // Each existing key should get the 'down' class and have its click handler disabled.
          let thisKey = $('#piano').find(`.key[data-numposition="${data.numposition}"]`);
          $(thisKey).addClass('down').off();
        });
        if (result.length === 24) {
          let errorMessage = $(`
          <p class="notesComplete center"><i class="far fa-check-circle"></i> All notes have been added!</p>
          `);
          $('section.boxContent').empty();
          $(errorMessage).appendTo('section.boxContent');
        }
        initNoteButtonHandlers();
      }
    });
  }; 

  // On click get one root note's data and then update the form
  window.doGetOneNote = (thisNote, numPos) => {
    // Reset the form.
    $('div.addForm form').find(':input').val('');
    let noteTitle = $(thisNote).data('title');
    // 24-bit binary made easy: Convert to binary and pad the start with up to 24 zeroes. 
    let noteBinPos = numPos.toString(2).padStart(24, '0');
    // Fill the form fields with the data we've obtained.
    $('div.addForm form').find('input[name="title"]').val(noteTitle);
    $('div.addForm form').find('input[name="binposition"]').val(noteBinPos);
    $('div.addForm form').find('input[name="numposition"]').val(numPos);
  };

  const doGetWikiPageId = (wikiPageName) => {
    $('div.errorMessages').empty();
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
          $(errorMessage).appendTo('div.errorMessages');
          $('div.errorMessages').show();
        } else {
          // Grab the page id from the response and add it to the form.
          let pageId = Object.keys(result.query.pages)[0];
          $('div.addForm form').find('input[name="wikipageid"]').val(pageId);
        }
      },
      error: function(result){
        // If the search can't be completed (which, with a valid Wikipedia URL should be impossible)...
        let errorMessage = $(`
        <p><i class="fas fa-exclamation-triangle"></i> An error occured. Did you paste the whole URL?</p>
        `);
        $(errorMessage).appendTo('div.errorMessages');
      },
    });

  };

  // PUT updates root notes {id} and then update the view.
  const doSaveNote = (updateData) => {
    $.ajax({
      type: 'POST',
      url: xhrAddNote,
      contentType: 'application/x-www-form-urlencoded',
      data: updateData,
      dataType: 'json',
      success: function () {
        $('div.addForm form').find(':input').val('');
        doGetNotes();
      },
      error: function (result) {
        result = result.responseJSON;
        if(Object.keys(result.errors).length > 0) {
          $.each(result.errors.fields, function(i, data) {
            let errorMessage = $(`
              <p><i class="fas fa-exclamation-triangle"></i> ${data}</p>
            `);
            $(errorMessage).appendTo('div.errorMessages');
          });
          $('div.errorMessages').show();
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
    const pageHelp = $('section.pageHelp');
    // Get the localStorage value of showAddRootNoteHelp to see if the help should remain hidden.
    // Of course only strings can be stored in localStorage right now, so the logic looks bad...
    // ...or there's a better way to write it. Either/or.
    let showHelp = localStorage.getItem('showAddRootNoteHelp');
    if (showHelp === null) {
      localStorage.setItem('showAddRootNoteHelp',true);
      pageHelp.show();
    } else if (showHelp === 'true') {
      pageHelp.show();
    } else if (showHelp === 'false') {
      pageHelp.hide();
    }    
    initPiano(); // Set click handlers to each piano key.
    doGetNotes(); // Just run this automatically once the document is ready...
  };
  readySetLoad();


});