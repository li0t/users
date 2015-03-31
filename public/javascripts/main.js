$('#deleteUserBtn').on('click' , function() {
  $.ajax({
    method: "DELETE",
    url:  $(location).attr('pathname')
  }).success(function( msg ) {
      console.log('TRIUMPH');
    $(location).attr('pathname', '/' );
  }).error(function(msg){
    console.log(msg);
  });
});