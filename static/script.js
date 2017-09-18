// Open modal on any image click
$(function() {

  $('body').on('click', 'img.can-open', function () {
    // const $img = $('<img>').addClass('modal__image').attr('alt', 'Image preview').attr('src', $(this).attr('src'));
    // $('.modal__body').html($img);
    const $img = $('<div class="modal__image">').css('background-image', 'url(' + $(this).attr('src') + ')');
    $('.modal__body').html($img);
    $('#image-modal').show();
  });
  // Close modal on click
  $('#image-modal').on('click', function () {
    $('#image-modal').hide();
  });

  $('.my-navbar__toggle').click(function () {
    $('.my-navbar__link').toggleClass('my-navbar__link--hidden');
  });
});
