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
});
