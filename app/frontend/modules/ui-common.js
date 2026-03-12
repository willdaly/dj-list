export function showMessage(message) {
  $('#message').empty().append(`<a data-target='#'>${message}</a>`);
  $('#message a').delay(2500).fadeOut(500, () => { $('#message a').remove(); });
}

export function showModalHeaderMessage(message) {
  $('.modal-header').append(`<p>${message}</p>`);
  $('.modal-header p').delay(2500).fadeOut(500, () => { $('.modal-header p').remove(); });
}

export function noSongSelected() {
  showMessage('no songs selected. click on rows to select.');
}

export function getSelectedSongIds() {
  var fakeArray = $('tr.ui-selectee.ui-selected');
  if (fakeArray.length > 0) {
    var realArray = $.makeArray(fakeArray);
    return $.map(realArray, function(row) { return row.id; });
  }

  noSongSelected();
  return null;
}

export function getSelectedGenres() {
  if ($('li').hasClass('ui-selected')) {
    var array = [];
    $('li.ui-selected').each(function() {
      array.push($(this).text());
    });
    return array;
  }

  showMessage('select at least one genre');
  return null;
}

export function bindSelectableRows() {
  $('#searchResults').bind('mousedown', (e) => { e.metaKey = true; }).selectable();
}
