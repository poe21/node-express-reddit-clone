// modules
var mysql = require('mysql');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var path = require('path');
var express = require('express');
var app = express();

// middlewares
app.use(bodyParser());
app.use(cookieParser());
app.use(checkLoginToken);

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
              <h3 class="content-item__title">
                <a href="${post.url}">${post.title}</a>
              </h3>
              <p>Created by ${post.user.username}</p>
              <h4><b>Votes: ${post.totalVotes}</b></h4>
            <form action="/vote" method="post">
              <input type="hidden" name="vote" value="1">
              <input type="hidden" name="postId" value="${post.postId}">
              <button type="submit">upvote this</button>
            </form>
            <form action="/vote" method="post">
              <input type="hidden" name="vote" value="-1">
              <input type="hidden" name="postId" value="${post.postId}">
              <button type="submit">downvote this</button>
            </form>
            </li>`;
        });
        if (!request.loggedInUser) {
          response.send(`
            <h1>REDDIT</h1>
            <nav><a href="/signup">Sign Up</a> | <a href="/login">Log in</a></nav>
            <div id="contents">
              <h3>SORT BY:</h3> <nav><a href="/sort/new">New</a> ||  <a href="/sort/hot">Hot</a> ||  
              <a href="/sort/top">Top</a> ||  <a href="/sort/controversial">Controversial</a></nav>
              <h2>List of contents</h2>
              <ul class="contents-list">
                ${allPosts.join('')}
              </ul>
            </div>
          `);
        } else {
          response.send(`
            <h1>REDDIT</h1>
            <nav><a href="/createpost">Create post</a> | <a href="/logout">Log Out</a></nav>
            <div id="contents">
              <h3>SORT BY:</h3> <nav><a href="/sort/new">New</a> ||  <a href="/sort/hot">Hot</a> ||  
              <a href="/sort/top">Top</a> ||  <a href="/sort/controversial">Controversial</a></nav>
              <h2>List of contents</h2>
              <ul class="contents-list">
                ${allPosts.join('')}
              </ul>
            </div>
          `);
        }
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
      var allPosts = posts.map(function(post) {
        return `
          <li class="content-item">
            <h3 class="content-item__title">
              <a href="${post.url}">${post.title}</a>
            </h3>
            <p>Created by ${post.user.username}</p>
            <h4><b>Votes: ${post.totalVotes}</b></h4>
          <form action="/vote" method="post">
            <input type="hidden" name="vote" value="1">
            <input type="hidden" name="postId" value="${post.postId}">
            <button type="submit">upvote this</button>
          </form>
          <form action="/vote" method="post">
            <input type="hidden" name="vote" value="-1">
            <input type="hidden" name="postId" value="${post.postId}">
            <button type="submit">downvote this</button>
          </form>
          </li>`;
      });
      if (!request.loggedInUser) {
        response.send(`
          <h1>REDDIT</h1>
          <nav><a href="/signup">Sign Up</a> | <a href="/login">Log in</a></nav>
          <div id="contents">
            <h3>SORT BY:</h3> <nav><a href="/sort/new">New</a> ||  <a href="/sort/hot">Hot</a> ||  
            <a href="/sort/top">Top</a> ||  <a href="/sort/controversial">Controversial</a></nav>
            <h2>List of contents</h2>
            <ul class="contents-list">
              ${allPosts.join('')}
            </ul>
          </div>
        `);
      } else {
        response.send(`
          <h1>REDDIT</h1>
          <nav><a href="/createpost">Create post</a> | <a href="/logout">Log Out</a></nav>
          <div id="contents">
            <h3>SORT BY:</h3> <nav><a href="/sort/new">New</a> ||  <a href="/sort/hot">Hot</a> ||  
            <a href="/sort/top">Top</a> ||  <a href="/sort/controversial">Controversial</a></nav>
            <h2>List of contents</h2>
            <ul class="contents-list">
              ${allPosts.join('')}
            </ul>
          </div>
        `);
      }
    }
  });
});

// sign up
app.get('/signup', function(request, response) {
  response.sendFile(path.join(__dirname + '/signup.html'));
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
  response.sendFile(path.join(__dirname + '/login.html'));
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
    response.status(401).send('?!?....you must be logged in to log out.');
  } else {
    redditAPI.logOut(request.loggedInUser.userId, request.loggedInUser.token, function(err, result) {
      if (err) {
        response.status(500).send('Oops! An error occurred. Please try again later!');
      } else {
        response.clearCookie('SESSION');
        response.send(`<h1>REDDIT</h1> You were successfully logged out.
        <br><br><a href="/">Go back to homepage</a>`);
      }
    });
  }
});

// Create post
app.get('/createpost', function(request, response) {
  response.sendFile(path.join(__dirname + '/createpost.html'));
});

app.post('/createpost', function(request, response) {
  if (!request.loggedInUser) {
    response.status(401).send('You must be logged in to create content!');
  } else {
    var newPost = {
      title: request.body.title,
      url: request.body.url,
      userId: request.loggedInUser.userId
    };
    redditAPI.createPost(newPost, function(err, post) {
      if (err) {
        response.status(500).send('Oops! An error occurred. Please try again later!');
      } else {
        response.redirect('/');
      }
    });
  }
});

// votes

app.post('/vote', function(request, response) {
  if (!request.loggedInUser) {
    response.status(401).send('You must be logged in to vote!');
  } else {
    var vote = {
      userId: request.loggedInUser.userId,
      postId: request.body.postId,
      vote: request.body.vote
    };
    console.log(vote);
    redditAPI.castOrUpdateVote(vote, function(err, result) {
      if (err) {
        response.status(500).send(`<h1>REDDIT</h1> 
          Oops! An error occurred. Please try again later!
          <br><br><a href='/'>Go back to homepage</a>`);
      } else {
        response.redirect('/');
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
