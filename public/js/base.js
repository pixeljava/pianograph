// Menu Button Logic
$(function() {
  $('#navMenuButton').click( function(){
    $(this).toggleClass('open');
    $('nav#navMenu').slideToggle(350);
  });
});