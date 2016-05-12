// modules and imports
var mysql = require('mysql');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var path = require('path');
var express = require('express');
var app = express();
var forms = require('./forms');
var React = require('react');
var render = require('react-dom/server').renderToStaticMarkup;

// create a connection to our Cloud9 server
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'poe211',
  password : '',
  database: 'reddit'
});

// load our API and pass it the connection
var reddit = require('./reddit');
var redditAPI = reddit(connection);

// middlewares
app.use(bodyParser());
app.use(cookieParser());
app.use(checkLoginToken);
app.use(express.static('public'));

function checkLoginToken(request, response, next) {
  if (request.cookies.SESSION) {
    redditAPI.getUserFromSession(request.cookies.SESSION, function(err, user) {
      if (user) {
        request.loggedInUser = user;
      }
      next();
    });
  } else {
    next();
  }
}

var loggedOut = `<nav class="userLogin"><a href="/signup">Sign Up</a><a href="/login">Log in</a></nav>`;
var loggedIn = `<nav class="userLogin"><a href="/">My account</a><a href="/logout">Log Out</a></nav>`;

function createHead(pageTitle, request, content){
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${pageTitle}</title>
        <link rel="stylesheet" type="text/css" href="../css/main.css">
        <link rel="stylesheet" href="http://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.4.0/css/font-awesome.min.css">
      </head>
      <body class="overlay">
        <div class="wrapper">
          <header>
            <a href='/'><img class="logo" src="http://images.dailytech.com/nimage/Reddit_Logo_Wide.jpg"></a>
            ${request.loggedInUser ? loggedIn : loggedOut}
          </header>
          <main>
            ${content}
          </main>
          <footer>
            <p>RedditClone &copy; Annie 2016</p>
          </footer>
        </div>
        
        <script src="https://code.jquery.com/jquery-1.12.3.js"></script>
        <script src="../js/main.js"></script>
      </body>
    </html>
  `;
}

// Sorted homepage
app.get('/sort/:sort', function (request, response) {  // choice of: top, hot, new, controversial
  var sort = request.params.sort;
  if (sort === "top" || sort === "hot" || sort === "new" || sort === "" || sort === "controversial") {
    redditAPI.getSortedHomepage(sort, function(err, posts) {
      if (err) {
        response.status(500).send('oops try again later!');
      } 
      else {
        var allPosts = posts.map(function(post) {
          return `
            <li class="content-item">
              <div class="postInfo">
                <h3 class="content-item__title">
                  <a href="${post.url}">${post.title}</a>
                </h3>
                <p>Created by ${post.user.username}</p>
              </div>
              <div class="votes">
                <p class="voteScore${post.postId}">Votes: ${post.totalVotes}</p>
                <form class="voteForm arrowUp" action="/vote" method="post">
                  <input type="hidden" name="vote" value="1">
                  <input type="hidden" name="postId" value="${post.postId}">
                  <button class="vote" type="submit"><i class="fa fa-caret-up" aria-hidden="true"></i></button>
                </form>
                <form class="voteForm arrowDown" action="/vote" method="post">
                  <input type="hidden" name="vote" value="-1">
                  <input type="hidden" name="postId" value="${post.postId}">
                  <button class="vote" type="submit"><i class="fa fa-caret-down" aria-hidden="true"></i></button>
                </form>
              </div>
            </li>`;
        });
        response.send(createHead("Reddit Clone | Homepage", request, `
          <div class="sort-nav">
            <h3>SORT BY:</h3> <a href="/sort/new">New</a><a href="/sort/hot">Hot</a><a href="/sort/top">Top</a><a href="/sort/controversial">Controversial</a>
            <h2>List of contents</h2>
          </div>
          <ul class="contents-list">
            ${allPosts.join('')}
          </ul>
        `));
      }
    });
  } else {
    response.status(400).send('Error: you have to choose a sorting method (top, hot, new or controversial)');
  }
});


// homepage
app.get('/', function (request, response) {
  redditAPI.getHomepage(function(err, posts) {
    if (err) {
      response.status(500).send('oops try again later!');
    } 
    else {
      response.redirect('/sort/hot');
    }
  });
});

// sign up
app.get('/signup', function(request, response) {
  forms.signup(function(err, result) {
    if (err) {
      response.send(err);
    } else {
      response.send(createHead("Reddit Clone | Sign Up", request, result));
    }
  });
});

app.post('/signup', function(request, response) {
  var createdUser = { 
    username: request.body.username,
    password: request.body.password
  };
  redditAPI.createUser(createdUser, function(err, result) {
      if (err) {
        response.send(err);
      } else {
        response.redirect("/");
      }
  });
});

// login
app.get('/login', function(request, response) {
  forms.login(function(err, result) {
    if (err) {
      response.send(err);
    } else {
      response.send(createHead("Reddit Clone | Log In", request, result));
    }
  });
});

app.post('/login', function(request, response) {
  redditAPI.checkLogin(request.body.username, request.body.password, function(err, user) {
      if (err) {
        response.status(401).send(err.message + `<br><a href='/signup'>Sign up</a> | <a href='/login'>Log in</a>`);
      } else {
        redditAPI.createSession(user.id, function(err, token) {
          if (err) {
            response.status(500).send('Oops! An error occurred. Please try again later!');
          } else {
            response.cookie('SESSION', token);
            response.redirect('/');
          }
        });
      }
  });
});

// log out

app.get('/logout', function(request, response) {
  if (!request.loggedInUser) {
    response.status(401).send(createHead("Reddit Clone | Error", request, '<p>?!?....you must be logged in to log out.</p>'));
  } else {
    redditAPI.logOut(request.loggedInUser.userId, request.loggedInUser.token, function(err, result) {
      if (err) {
        response.status(500).send(createHead("Reddit Clone | Error", request,'Oops! An error occurred. Please try again later!'));
      } else {
        response.clearCookie('SESSION');
        response.send(createHead("Reddit Clone | Log Out", request, `<p>You were successfully logged out.</p>`));
      }
    });
  }
});

// Create post
app.get('/createpost', function(request, response) {
  forms.createPost(function(err, result) {
    if (err) {
      response.status(500).send(createHead("Reddit Clone | Error", request, `
          Oops! An error occurred. Please try again later!`));
    } else {
      response.send(createHead("Reddit Clone | Create Post", request, result));
    }
  });
});

app.post('/createpost', function(request, response) {
  if (!request.loggedInUser) {
    response.status(401).send(createHead("Reddit Clone | Error", request, 'You must be logged in to create content!'));
  } else {
    var newPost = {
      title: request.body.title,
      url: request.body.url,
      userId: request.loggedInUser.userId
    };
    redditAPI.createPost(newPost, function(err, post) {
      if (err) {
        response.status(500).send(createHead("Reddit Clone | Error", request, 'Oops! An error occurred. Please try again later!'));
      } else {
        response.redirect('/');
      }
    });
  }
});

// votes

app.post('/vote', function(request, response) {
  if (!request.loggedInUser) {
    response.status(401).send(createHead("Reddit Clone | Error", request, 'You must be logged in to vote!'));
  } else {
    var vote = {
      userId: request.loggedInUser.userId,
      postId: request.body.postId,
      vote: request.body.vote
    };
    redditAPI.castOrUpdateVote(vote, function(err, result) {
      if (err) {
        response.status(500).send(createHead("Reddit Clone | Error", request, `
          Oops! An error occurred. Please try again later!`));
      } else {
        redditAPI.getVotesForPost(Number(vote.postId), function(err,res){
          response.send(res);
        });
      }
    });
  }
});

/* YOU DON'T HAVE TO CHANGE ANYTHING BELOW THIS LINE :) */

// Boilerplate code to start up the web server
var server = app.listen(process.env.PORT, process.env.IP, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
