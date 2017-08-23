// Open modal on any image click
$(function() {
  $('body').on('click', 'img.can-open', function () {
    const $img = $('<img>').addClass('img-responsive').attr('alt', 'Image preview').attr('src', $(this).attr('src'));
    $('.modal-body').append($img);
    $('#image-modal').modal('show');
  });
  // Close modal on click
  $('#image-modal').on('click', function () {
    $('#image-modal').modal('hide');
  });

  $('#image-modal').on('hidden.bs.modal', function () {
    $('.modal-body').empty();
  });

  $('.section').hover(function () {
    $('i', this).addClass('hovering');
  }, function () {
    $('i', this).removeClass('hovering');
  });
});
