$( document ).ready(function() {
  const xhrGetNotes = '/api/rootnotes'; // GET all root notes
  const xhrAddNote = '/api/scales/add'; // POST root note

  // The big number for this whole page. Tracks the current numpositions of all clicked notes.
  // It technically contains all of the information necessary to display a scale. No pressure...
  let currNumPos = 0;

  function objectifyForm(formArray) {
    // Fix for POST/PUT
    var returnArray = {};
    for (var i = 0; i < formArray.length; i++){
        returnArray[formArray[i]['name']] = formArray[i]['value'];
    }
    return returnArray;
  }

  // There's an easy mathematical test to find the corresponding root note on the piano...
  // Since we use a 24 key piano (and scales use every corresponding note on the piano) we mark
  // both of them. When chords are eventually introduced the 24-key piano will make more sense.
  function matchingNote(thisKey) {
    let keyNum = $(thisKey).attr('data-numposition');
    let matchNum = 0;
    matchNum = keyNum < 4096 ? keyNum * 4096 : keyNum / 4096;
    return $('#piano').find(`.key[data-numposition="${matchNum}"]`);
  }

  // Set the root note for the scale when clicking the first note on the piano
  function setRootNote(thisKey) {
    // Find the matching root note on the piano.
    let thisKeyToo = matchingNote(thisKey);
    // Get both numpositions and rootnoteId for later use
    let rootnoteId = $(thisKey).data('rootnoteId');
    let numPos = $(thisKey).data('numposition');
    let numPosToo = $(thisKeyToo).data('numposition');

    // Push the root note value to a hidden input on the form
    $('div.addForm form').find('input#formRootnoteId').val(rootnoteId);
    // Use a helper function to add the numbers to curNumPos and update the form.
    doNumToTotal(numPos, 'plus', numPosToo);

    // Use a micro-template to add a marker to the root notes.
    let keyLabels = $(thisKey).add(thisKeyToo).find('.keyLabel');
    const rootnoteMarker = $(`<span class="scaleRoot"><i class="fas fa-asterisk"></i></span>`);
    $(rootnoteMarker).prependTo(keyLabels);
    // Set the class 'down', a scaleroot data attribute, and disable clicks on both corresponding notes
    $(thisKey).add(thisKeyToo).attr('data-scaleroot', 'true').addClass('down').off();

    // Reenable the rest of the keys on the piano
    let keys = $('#piano').find('.key');
    $.each(keys, function(i, key) {
      // Remove the 'disabled' class
      $(key).removeClass('disabled').off();
      // Then add click handlers back in that further build the scale.
      if (!$(key).attr('data-scaleroot')) {
        // Set a new click handler for each note
        $(key).off().on('click', function() {setScaleNote(key);});
      } 
    });

    // Change the content box header to show the root note
    const noteTitle = $(thisKey).attr('data-title');
    const contentBoxHead = $('div.boxHead');
    const boxHeader = `<p class="boxTitle left">Adding Scale to Note: ${noteTitle}</p><br style="clear: both;" />`;
    $(contentBoxHead).empty().append(boxHeader);
  }

  // Helper function takes {numPos, 'plus' or 'minus', numPosToo}, calculates and updates the form.
  function doNumToTotal(numPos, op, numPosToo) {
    // Add/subtract the numposition values to/from the currNumPos
    if (op === "plus") {
      currNumPos += (numPos + numPosToo);
    } else if (op === "minus") {
      currNumPos -= (numPos + numPosToo);
    }
    // Update the number position on the form 
    $('div.addForm form').find('input#formNumposition').val(currNumPos);
    // 24-bit binary made easy: Convert to binary and pad the start with up to 24 zeroes. 
    let currBinPos = currNumPos.toString(2).padStart(24, '0');
    // Update the binary position on the form
    $('div.addForm form').find('input#formBinposition').val(currBinPos);
  }

  // Click event set on non-root, not selected notes to select them on click
  function setScaleNote(thisKey) {
    // Get the number value of both keys
    let thisKeyToo = matchingNote(thisKey);
    const numPos = $(thisKey).data('numposition');
    const numPosToo = $(thisKeyToo).data('numposition');
    // Use our helper function to add the two numbers to currNumPos and update the form.
    doNumToTotal(numPos, 'plus', numPosToo);
    // Set 'down' class and add the unsetScaleNote click handler on both keys
    $(thisKey).add(matchingNote(thisKey)).addClass('down').off().on('click', function() { unsetScaleNote(thisKey); });
  }

  // Click event set on non-root, already selected notes to unselect them on click
  function unsetScaleNote(thisKey) {
    // Get the number value of both keys
    let thisKeyToo = matchingNote(thisKey);
    const numPos = $(thisKey).data('numposition');
    const numPosToo = $(thisKeyToo).data('numposition');
    // Use our helper function to subrtact the two numbers and update the form.
    doNumToTotal(numPos, 'minus', numPosToo);
    // Remove 'down' class and add the setScaleNote click handler on both keys
    $(thisKey).add(matchingNote(thisKey)).removeClass('down').off().on('click', function() { setScaleNote(thisKey); });
  }

  const initNoteButtonHandlers = () => {
    // Help Close Button
    $('button.closeHelp').off().on('click', function (e) {
      localStorage.setItem('showAddScalesHelp',false);
      const pageHelp = $('section.pageHelp');
      pageHelp.hide();
    });
    // Event handlers for the updateForm buttons
    //The 'Save' button
    $(`button#saveNote:button`).off().on('click', function (e) {
      // Flush any error messages, hide the error message area
      $('div.errorMessages').empty();
      $('div.errorMessages').hide();
      // Grab form data and pass it through objectifyForm
      let reqData = $('div.addForm form').serializeArray();
      reqData = objectifyForm(reqData);
      // Now that the data is in the right form we can submit it.
      doSaveScale(reqData);
    });
    //The 'Reset' button
    $('button#resetNote').off().on('click', function (e) {
      // Flush any error messages, hide the error message area
      $('div.errorMessages').empty();
      $('div.errorMessages').hide();
      // Run doGetNotes to reinititalize the page
      doGetNotes();
    });
    // Gets Wikipedia Page Ids from Wikipedia URLs
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
    // First reset the form
    $('div.addForm form').find(':input').val('');
    // Remove all keys with .down class
    $('#piano').find('.key').removeClass('down');
    // Remove the root note marker
    $('#piano .scaleRoot').remove();
    // Reset the value of currNumPos
    currNumPos = 0;
    // Then fill it with the results of the AJAX call.
    $.ajax({
      type: 'GET',
      url: xhrGetNotes,
      contentType: 'application/json',
      dataType: 'json',
      success: function(result){
        // One of those places binary comes in *really* handy... even represented in decimal form.
        // We'll disable the entry form unless all of the first half of the piano's root notes have been created.
        // Mathematically, the numpositions of the second half of the piano all total 4095. 
        // Since the dividing line is 'B' (4096) that means *no* combination of keys on the right half could
        // numerically replicate a key on the left. That's one of the many reasons to use binary in this project.
        let lockAddScales = 0; 
        $.each(result, function(i, data) {
          // Add each numposition to lockAddScales (it will need to be >= 16773120, the total left half of the piano.)
          lockAddScales += data.numposition;
          // Each existing key should get a rootnoteId added to it.
          let thisKey = $('#piano').find(`.key[data-numposition="${data.numposition}"]`);
          $(thisKey).attr('data-rootnote-id', `${data.id}`);
        });
        if (lockAddScales < 16773120) {
          // Not enough root notes have been defined... Create a 'empty set' type template and show it.
          $('section.boxContent').empty();
          const emptySetTemplate = $(`
          <p class="emptySet center"><i class="fas fa-exclamation-triangle"></i> Not enough root notes to create scales.
          Please add root notes for at least the first half of the piano before creating scales.</p>
          `);
          emptySetTemplate.appendTo('section.boxContent');
        } else {
          // Let's disable the second half of the piano for UX. Once a root note is chosen we'll reenable it.
          let keys = $('#piano').find('.key');
          $.each(keys, function(i, key) {
            // The first 12 keys on the left are 2^0 to 2^11. 2^11 is 2048 (C). 2^12 is 4096 (B), but we still want that.
            if ($(key).attr('data-numposition') < 4096) { // Get everything right of (less than) 4096 (the B note)...
              $(key).addClass('disabled').off(); // ...and add the 'disabled' class and remove click handlers.
            } else {
              // Each key on the the left side of the piano gets the setRootNote click handler.
              $(key).off().on('click', function() { setRootNote(key); });
            }
          });
          // Initiate the events for the buttons on the page
          initNoteButtonHandlers();
        }
      }
    });
  }; 

  // Use Wikipedia's API to find the Page Id from the given URL.
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

  // POST adds a scale and then update the view.
  const doSaveScale = (updateData) => {
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
        // Use the errors returned by the API to populate the error message area
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

  // Run all of the code that should execute automatically when the page loads.
  const readySetLoad = () => {
    const pageHelp = $('section.pageHelp');
    // Get the localStorage value of showAddRootNoteHelp to see if the help should remain hidden.
    // Of course only strings can be stored in localStorage right now, so the logic looks bad...
    // ...or there's a better way to write it. Either/or.
    let showHelp = localStorage.getItem('showAddScalesHelp');
    if (showHelp === null) {
      localStorage.setItem('showAddRootNoteHelp',true);
      pageHelp.show();
    } else if (showHelp === 'true') {
      pageHelp.show();
    } else if (showHelp === 'false') {
      pageHelp.hide();
    }    

    doGetNotes(); // Just run this automatically once the document is ready...
  };
  readySetLoad();
});
