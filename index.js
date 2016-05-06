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

function createHead(request, content){
  if (!request.loggedInUser) {
    return `
      <head>
        <link rel="stylesheet" type="text/css" href="../css/main.css">
      </head>
      <body>
        <header>
          <a href='/'><img src="http://images.dailytech.com/nimage/Reddit_Logo_Wide.jpg"></a>
          <nav><a href="/signup">Sign Up</a> | <a href="/login">Log in</a></nav>
        </header>
        ${content}
      </body>
    `;
  } else {
    return `
      <head>
        <link rel="stylesheet" type="text/css" href="../css/main.css">
      </head>
      <body>
        <header>
          <a href='/'><img src="http://images.dailytech.com/nimage/Reddit_Logo_Wide.jpg"></a>
          <nav><a href="/createpost">Create post</a> | <a href="/logout">Log Out</a></nav>
        </header>
        ${content}
      </body>
    `;
  }
}

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

// test 

app.get('/test', function(request, response) {
  redditAPI.getHomepage(function(err, posts) {
    if (err) {
      response.status(500).send('try again later!');
    }
    else {
      var htmlStructure = ({posts: posts}); // calling the function that "returns JSX"
      var html = render(htmlStructure); // rendering the JSX "structure" to HTML
      response.send(html);
    }
  });
});

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
          response.send(createHead(request, `
            <div id="contents">
              <h3>SORT BY:</h3> <nav><a href="/sort/new">New</a> ||  <a href="/sort/hot">Hot</a> ||  
              <a href="/sort/top">Top</a> ||  <a href="/sort/controversial">Controversial</a></nav>
              <h2>List of contents</h2>
              <ul class="contents-list">
                ${allPosts.join('')}
              </ul>
            </div>
          `));
        } else {
          response.send(createHead(request, `
            <div id="contents">
              <h3>SORT BY:</h3> <nav><a href="/sort/new">New</a> ||  <a href="/sort/hot">Hot</a> ||  
              <a href="/sort/top">Top</a> ||  <a href="/sort/controversial">Controversial</a></nav>
              <h2>List of contents</h2>
              <ul class="contents-list">
                ${allPosts.join('')}
              </ul>
            </div>
          `));
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
        response.send(createHead(request, `
          <div id="contents">
            <h3>SORT BY:</h3> <nav><a href="/sort/new">New</a> ||  <a href="/sort/hot">Hot</a> ||  
            <a href="/sort/top">Top</a> ||  <a href="/sort/controversial">Controversial</a></nav>
            <h2>List of contents</h2>
            <ul class="contents-list">
              ${allPosts.join('')}
            </ul>
          </div>
        `));
      } else {
        response.send(createHead(request, `
          <div id="contents">
            <h3>SORT BY:</h3> <nav><a href="/sort/new">New</a> ||  <a href="/sort/hot">Hot</a> ||  
            <a href="/sort/top">Top</a> ||  <a href="/sort/controversial">Controversial</a></nav>
            <h2>List of contents</h2>
            <ul class="contents-list">
              ${allPosts.join('')}
            </ul>
          </div>
        `));
      }
    }
  });
});

// sign up
app.get('/signup', function(request, response) {
  forms.signup(function(err, result) {
    if (err) {
      response.send(err);
    } else {
      response.send(createHead(request, result));
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
      response.send(createHead(request, result));
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
    response.status(401).send(createHead(request, '<p>?!?....you must be logged in to log out.</p>'));
  } else {
    redditAPI.logOut(request.loggedInUser.userId, request.loggedInUser.token, function(err, result) {
      if (err) {
        response.status(500).send(createHead(request,'Oops! An error occurred. Please try again later!'));
      } else {
        response.clearCookie('SESSION');
        response.send(createHead(request, `<p>You were successfully logged out.</p>`));
      }
    });
  }
});

// Create post
app.get('/createpost', function(request, response) {
  forms.createPost(function(err, result) {
    if (err) {
      response.send(createHead(request, err));
    } else {
      response.send(createHead(request, result));
    }
  });
});

app.post('/createpost', function(request, response) {
  if (!request.loggedInUser) {
    response.status(401).send(createHead(request, 'You must be logged in to create content!'));
  } else {
    var newPost = {
      title: request.body.title,
      url: request.body.url,
      userId: request.loggedInUser.userId
    };
    redditAPI.createPost(newPost, function(err, post) {
      if (err) {
        response.status(500).send(createHead(request, 'Oops! An error occurred. Please try again later!'));
      } else {
        response.redirect('/');
      }
    });
  }
});

// votes

app.post('/vote', function(request, response) {
  if (!request.loggedInUser) {
    response.status(401).send(createHead(request, 'You must be logged in to vote!'));
  } else {
    var vote = {
      userId: request.loggedInUser.userId,
      postId: request.body.postId,
      vote: request.body.vote
    };
    console.log(vote);
    redditAPI.castOrUpdateVote(vote, function(err, result) {
      if (err) {
        response.status(500).send(createHead(request, `
          Oops! An error occurred. Please try again later!`));
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
