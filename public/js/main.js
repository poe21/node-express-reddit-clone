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
    
    // vote error popup if user not logged in
    if(result === "notLogged") {
      $('.vote').on('click', 
      function(){
        $(this).prepend("<p class='voteFail-popup'>You have to be logged in to vote !</p>");
        $('.voteFail-popup').fadeOut(2200);
      });
    }
    
    if (result) {
      $.get("/checkVotes", function(votes) {
        if (votes) {
          var data = votes;
          $.each(data, function(i){
            if(data[i].vote === 1){
              $("#upVote"+data[i].postId).css('color', '#1768b5');
            } else if(data[i].vote === -1){
              $("#downVote"+data[i].postId).css('color', 'red');
            }
          });
        }
      });
    }
  });
});