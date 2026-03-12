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
  var fakeArray = $('#searchResults tr.is-selected');
  if (fakeArray.length > 0) {
    var realArray = $.makeArray(fakeArray);
    return $.map(realArray, function(row) { return row.id; });
  }

  noSongSelected();
  return null;
}

export function getSelectedGenres() {
  if ($('.genres li').hasClass('is-selected')) {
    var array = [];
    $('.genres li.is-selected').each(function() {
      array.push($(this).text());
    });
    return array;
  }

  showMessage('select at least one genre');
  return null;
}

export function initGenreSelection() {
  $('.genres').on('click', 'li', function() {
    $(this).toggleClass('is-selected');
  });
}

export function initResultSelection() {
  $('#searchResults').on('click', 'tr', function(event) {
    if ($(event.target).closest('.order').length) {
      return;
    }

    if (event.metaKey || event.ctrlKey) {
      $(this).toggleClass('is-selected');
      return;
    }

    $('#searchResults tr.is-selected').removeClass('is-selected');
    $(this).addClass('is-selected');
  });
}
