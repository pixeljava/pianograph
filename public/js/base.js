// Menu Button Logic
$(function() {
  $('#navMenuButton').click( function(){
    $(this).toggleClass('open');
    $('nav #navMenuItems').slideToggle(350);
  });
});