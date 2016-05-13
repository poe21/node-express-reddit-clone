/* global $ */
$(document).ready(function() {
  $('.voteForm').on('submit', function(event) {
    event.preventDefault();
    var $this = $(this);
    var data = $this.serializeArray();

    var votes = {
      postId: Number(data[1].value),
      vote: Number(data[0].value)
    };

    $.post('/vote', votes,
      function(response) {
        $(".voteScore" + votes.postId).text("Votes: " + response[0].voteScore);
      }
    );
  });

  // suggest title
  $('.suggest-title').on('click', function() {
    
    $('.suggest-title').prop('disabled', true);
    $('.title').val('');
    $('#spinner').css('display', 'inline-block');
    
    var url = $('.url').val();
    
    $.get('/getTitle?url=' + url,
      function(title) {
        $('.suggest-title').prop('disabled', false);
        $('#spinner').css('display', 'none');
        
        $('.title').val(title);
      }
    );
  });
  

  
  $.get("/checkLogin", function(result) {
    if(result === "no") {
      $('.fa-caret-up').on('click', 
      function(){
        $('.voteFail').remove();
        $(this).prepend("<div class='voteFail'>You have to log in to vote.</div>");
      });
    }
  });
  
  
});
