$( document ).ready(function() {
  const xhrGetNotes = '/api/rootnotes'; // GET all root notes
  const xhrGetScales = '/api/scales'; // GET all scales
  const xhrUpdateScale = '/api/scales/update'; // PUT scale {scaleId}
  const xhrDeleteScale = '/api/scales/remove'; // DELETE scale {scaleId}

  function objectifyForm(formArray) {
    // Fix for POST/PUT
    var returnArray = {};
    for (var i = 0; i < formArray.length; i++){
        returnArray[formArray[i]['name']] = formArray[i]['value'];
    }
    return returnArray;
  }

  let scaleTemplate = (scaleData) => `
    <div id="scale-${scaleData.id}" class="noteHolder" data-id="${scaleData.id}" data-title="${scaleData.title}"
          data-wikiurl="${scaleData.wikiurl}" data-wikipageid="${scaleData.wikipageid}"
          data-binposition="${scaleData.binposition}" data-numposition="${scaleData.numposition}"
          data-rootnote-id="${scaleData.rootnoteId}">
      <h1 class="noteTitle">Scale: ${scaleData.title}</h1>
      <div class="noteInfo">
        <p><strong>Wikipedia URL: </strong><a target="_blank" href="${scaleData.wikiurl}">${scaleData.wikiurl}</a></p>
        <p><strong>Wikipedia PageId: </strong>${scaleData.wikipageid}</p>
        <p><strong>PianoGraph: </strong>${scaleData.binposition} (${scaleData.numposition})</p>
      </div>
      <section class="formHolder">
        <div class="errorMessages"></div>
        <div class="updateForm">
          <form>
            <input type="hidden" id="rootnoteId-${scaleData.rootnoteId}"
                      name="rootnoteId" value="${scaleData.rootnoteId}">
            <div class="formInput">
              <label for="title">Scale Name:</label>
              <input type="text" id="title-${scaleData.id}" placeholder="Enter scale name..."
                      name="title" value="${scaleData.title}" maxlength="50" required>
            </div>
            <br />
            <div class="formInput">
              <label for="binposition">Binary Representation:</label>
              <input type="text" id="binposition-${scaleData.id}" placeholder="Enter binary..."
                      name="binposition" value="${scaleData.binposition}" maxlength="24" required>
            </div>
            <br />
            <div class="formInput">
              <label for="numposition">Numerical Representation:</label>
              <input type="text" id="numposition-${scaleData.id}" placeholder="Enter number..."
                      name="numposition" value="${scaleData.numposition}" maxlength="8" required>
            </div>
            <br />
            <div class="formInput">
              <label for="wikiurl">Wikipedia Link:</label>
              <input type="text" id="wikiurl-${scaleData.id}" placeholder="Enter URL..."
                      name="wikiurl" value="${scaleData.wikiurl}" maxlength="100" required>
            </div>
            <br />
            <div class="formInput">
              <label for="wikipageid">Wikipedia Page Id:</label>
              <input type="text" id="wikipageid-${scaleData.id}" placeholder="Enter Wikipedia page id..."
                      name="wikipageid" value="${scaleData.wikipageid}" maxlength="10">
            </div>
            <br />
            <div class="formButtons">
              <button class="saveButton" id="saveScale-${scaleData.id}" data-scale-id="${scaleData.id}" 
                      type="button" title="Save">
                <i class="far fa-save"></i> Save
              </button>
              <button class="cancelButton" id="cancelUpdate-${scaleData.id}" data-scale-id="${scaleData.id}"
                      type="button" title="Cancel">
                <i class="fas fa-times-circle"></i> Cancel
              </button>
              <div class="right">
                <button class="wikiButton" id="getWikiPageId-${scaleData.id}" data-scale-id="${scaleData.id}" 
                        type="button" title="Get Wikipedia Page Id" >
                  <i class="fab fa-wikipedia-w"></i> Get Wiki Page Id
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
      <div class="bottomButtons">
        <button class="viewButton" id="viewScale-${scaleData.id}" data-numposition="${scaleData.numposition}" title="View Scale">
          <i class="fas fa-music"></i> View
        </button>
        <button class="noteButton" id="viewNote-${scaleData.id}" data-note-id="${scaleData.rootnoteId}" title="View Root Note">
          <i class="fas fa-list-ul"></i> Root Note
        </button>
        <div class="right">
          <button class="updateButton" id="update-${scaleData.id}" data-scale-id="${scaleData.id}" title="Update Scale">
            <i class="fas fa-pencil-alt"></i> Update
          </button>
          <button class="deleteButton" id="delete-${scaleData.id}" data-scale-id="${scaleData.id}" title="Delete Scale">
            <i class="fas fa-trash-alt"></i> Delete
          </button>
        </div>
      </div>
    </div>
  `;
  
  // initData contains a copy of the response model from a GET operation.
  const initScaleButtonHandlers = (initData) => {
    // Help Close Button
    $('button.closeHelp').off().on('click', function (e) {
      localStorage.setItem('showScalesHelp',false);
      const pageHelp = $('section.pageHelp');
      pageHelp.hide();
    });
    // Event handlers for the updateForm buttons
    $(`button#saveScale-${initData.id}:button`).off().on('click', function (e) {
      const scaleId = $(this).data('scaleId');
      const scale = $(`div#scale-${scaleId}`);
      const errorMessages = $(scale).find('div.errorMessages');
      // Flush any error messages, hide the error message area
      errorMessages.empty();
      errorMessages.hide();

      let updateForm = $(scale).find('div.updateForm form');
      console.log('updateForm: ', updateForm);
      let reqData = $(updateForm).serializeArray();
      reqData = objectifyForm(reqData);

      doSaveScale(scaleId, reqData);
    });
    $(`button#cancelUpdate-${initData.id}:button`).off().on('click', function (e) {
      const scaleId = $(this).data('scaleId');
      const scale = $(`div#scale-${scaleId}`);
      const errorMessages = $(scale).find('div.errorMessages');
      const bottomButtons = $(scale).find('div.bottomButtons');
      const formHolder = $(scale).find('div.updateForm');
      const updateForm = $(scale).find('div.updateForm form');
      const inputFields = $(updateForm).find(':input');
      // Grab all data attributes from scale to reset the form
      const scaleData = scale.data();
      // For each input find the input named X in the form and set it to the value of X from scaleData.
      $.each(inputFields, function(i, data) {
          $(updateForm).find(`input[name="${data.name}"]`).val(scaleData[data.name]);
      });
      // Flush any error messages, hide the error message area
      errorMessages.empty();
      errorMessages.hide();
      // Show the bottom buttons, hide the form
      bottomButtons.toggle();
      formHolder.slideToggle(250);
    });
    $(`button#getWikiPageId-${initData.id}`).off().on('click', function (e) {
      const scaleId = $(this).data('scaleId');
      const scale = $(`div#scale-${scaleId}`);
      const updateForm = $(scale).find('div.updateForm form');
      let formUrl = $(updateForm).find('input[name="wikiurl"]').val();
      let urlPath = new URL(formUrl).pathname;
      let wikiPageName = urlPath.substr(urlPath.lastIndexOf('/') + 1);
      wikiPageName = decodeURIComponent(wikiPageName);
      doGetWikiPageId(scaleId, wikiPageName);
    });

    // Event handlers for noteHolder buttons
    $(`button#viewScale-${initData.id}:button`).off().on('click', function (e) {
      // Remove all keys with .down class
      const piano = $('#piano');
      $(piano).find('.key').removeClass('down');
      const numPos = $(this).data('numposition');
      var thisScale = $(`div.key[data-numposition="${numPos}"]`);
      thisScale.addClass('down');
    });

    $(`button#viewNote-${initData.id}:button`).off().on('click', function (e) {
      console.log(e);
    });
    $(`button#update-${initData.id}:button`).off().on('click', function (e) {
      const scaleId = $(this).data('scaleId');
      const scale = $(`div#scale-${scaleId}`);
      const formHolder = $(scale).find('div.updateForm');
      const bottomButtons = $(scale).find('div.bottomButtons');
      bottomButtons.toggle();
      formHolder.slideToggle(250);
    });
    $(`button#delete-${initData.id}:button`).off().on('click', function (e) {
      const scaleId = $(this).data('scaleId');
      const scale = $(`div#scale-${scaleId}`);
      const scaleTitle = $(scale).data('title');
      modal.open({content: $(`
        <h1 id="modalHeader">Confirm Delete</h1>
        <p id="modalText">Are you sure you want to delete scale: <strong>${scaleTitle}</strong>?</p>
        <button id="modalConfirm" class="modalButton red" title="Delete ${scaleTitle}">
          <i class="fas fa-trash-alt"></i> Delete
        </button>
        <button id="modalCancel" class="modalButton grey right" title="Cancel">
          <i class="fas fa-times-circle"></i> Cancel
        </button>
        `), width: 'max(80vw, 300px)'});
      // Set event listeners to the modal buttons
      $(`button#modalConfirm:button`).off().on('click', function (e) {
        doDeleteScale(scaleId);
      });
      $(`button#modalCancel:button`).off().on('click', function (e) {
        modal.close();
      });
    });
  };

  // GET all root notes and then update with view.
  const doGetNotes = () => {
    $.ajax({
      type: 'GET',
      url: xhrGetNotes,
      contentType: 'application/json',
      dataType: 'json',
      success: function(result){
        console.log('doGetNotes: ', doGetNotes);
      }
    });
  }; 

  // GET all scales and then update with view.
  const doGetScales = () => {
    // Remove all keys with .down class
    const piano = $('#piano');
    $(piano).find('.key').removeClass('down');
    // Clear the content box
    $('section.boxContent').empty();
    // Then fill it with the results of the AJAX call.
    $.ajax({
      type: 'GET',
      url: xhrGetScales,
      contentType: 'application/json',
      dataType: 'json',
      success: function(result){
        console.log('GET scales result: ', result);
        $.each(result, function(i, data) {
          // Place data on the keys: title, rootnoteId, numposition
          $(scaleTemplate(data)).appendTo('section.boxContent');
          initScaleButtonHandlers(data);
        });
      }
    });
  }; 

  // GET one scale by numPos and then update the view.
  window.doGetOneScaleByNum = (thisScale, numPos) => {
    // Remove all keys with .down class
    $('#piano').find('.key').removeClass('down');
    thisScale.addClass('down');
    // Clear the content box first
    $('section.boxContent').empty();
    $.ajax({
      type: 'GET',
      url: `${xhrGetScales}/number/${numPos}`,
      contentType: 'application/json',
      dataType: 'json',
      success: (result) => {
        $.each(result, function(i, data) {
          $(scaleTemplate(data)).appendTo('section.boxContent');
          initScaleButtonHandlers(data);
          // Change "view all scales" to "viewing scale {title)"
          const contentBoxHead = $('div.boxHead');
          const contentBoxTitle = $('p.boxTitle');
          const boxHeader = `
            <p class="boxTitle left">Viewing Scale: ${data.title}</p>
            <button id="resetView" class="titleReset right"><i class="fas fa-history"></i> See All Scales</button>
            <br style="clear: both;" />
          `;
          contentBoxHead.empty();
          $(boxHeader).appendTo(contentBoxHead);
          $(`button#resetView:button`).off().on('click', function (e) {
            doGetScales();
          });
        });
      },
      error: (result) => {
        console.log('Result Failure:', result);
      }
    });
  };

  // GET one scale by scaleId and then update the view.
  window.doGetOneScaleById = (scaleId) => {
    // Remove all keys with .down class
    const piano = $('#piano');
    $(piano).find('.key').removeClass('down');
    $.ajax({
      type: 'GET',
      url: `${xhrGetScales}/id/${scaleId}`,
      contentType: 'application/json',
      dataType: 'json',
      success: (result) => {
        $('section.boxContent').empty();
        $.each(result, function(i, data) {
          $(scaleTemplate(data)).appendTo('section.boxContent');
          initScaleButtonHandlers(data);
          // Change "view all scales" to "viewing scale {title)"
          const contentBoxHead = $('div.boxHead');
          const contentBoxTitle = $('p.boxTitle');
          const boxHeader = `
            <p class="boxTitle left">Viewing Scale: ${data.title}</p>
            <button id="resetView" class="titleReset right"><i class="fas fa-history"></i> See All Scales</button>
            <br style="clear: both;" />
          `;
          contentBoxHead.empty();
          $(boxHeader).appendTo(contentBoxHead);
          $(`button#resetView:button`).off().on('click', function (e) {
            doGetScales();
          });
          var thisScale = $(`div.key[data-numposition="${data.numposition}"]`);
          thisScale.addClass('down');
        });
      },
      error: (result) => {
        console.log('Result Failure:', result);
      }
    });
  };

  // @DONE!
  // DELETE deletes scale {id} and then update the view.
  const doDeleteScale = (scaleId) => {
    $.ajax({
      type: 'DELETE',
      url: `${xhrDeleteScale}/${scaleId}`,
      contentType: 'application/json',
      dataType: 'json',
      success: function(){
        modal.close();
        doGetScales();
      }
    });
  };

  const doGetWikiPageId = (scaleId, wikiPageName) => {
    const scale = $(`div#scale-${scaleId}`);
    const updateForm = $(scale).find('div.updateForm form');
    console.log('updateForm: ', updateForm);
    const errorMessages = $(scale).find('div.errorMessages');
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

  // PUT updates scale {id} and then update the view.
  const doSaveScale = (scaleId, updateData) => {
    const scale = $(`div#scale-${scaleId}`);
    const errorMessages = $(scale).find('div.errorMessages');
    $.ajax({
      type: 'PUT',
      url: `${xhrUpdateScale}/${scaleId}`,
      contentType: 'application/x-www-form-urlencoded',
      data: updateData,
      dataType: 'json',
      success: function () {
        doGetScales();
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
    $.each(allKeys, function(i, key) {
      let keyNumPos = $(key).data('numposition');
      $(key).off().on('click', function (e) {
        window.doGetOneScale($(this), keyNumPos); 
      });
    });
  };

  // Run all of the code that should execute automatically when the page loads.
  const readySetLoad = () => {
    const pageHelp = $('section.pageHelp');
    // Get the localStorage value of showScalesHelp to see if the help should remain hidden.
    // Of course only strings can be stored in localStorage right now, so the logic looks bad...
    // ...or there's a better way to write it. Either/or.
    let showHelp = localStorage.getItem('showScalesHelp');
    if (showHelp === null) {
      localStorage.setItem('showScalesHelp',true);
      pageHelp.show();
    } else if (showHelp === 'true') {
      pageHelp.show();
    } else if (showHelp === 'false') {
      pageHelp.hide();
    }    
    initPiano(); // Set click handlers to each piano key.
    //doGetNotes(); // Just run this automatically once the document is ready...
    doGetScales(); // Will probably get more specific and require a root note to load.
  };
  readySetLoad();


});