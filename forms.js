// sign up

function signup(callback) {
  callback(null, `<h2>Sign Up</h2>
  <form action="/signup" method="POST">
    <div>
      <input type="text" name="username" placeholder="Enter a username" required>
    </div>
    <div>
      <input type="password" name="password" placeholder="Enter a password" required>
    </div>
    
    <br>
    <button type="submit">Sign Up</button>
  </form>`);
}


// log in

function login(callback) {
  callback(null, `<h2>Log in</h2>
  <form action="/login" method="POST">
    <div>
      <input type="text" name="username" placeholder="Enter a username" required>
    </div>
    <div>
      <input type="password" name="password" placeholder="Enter a password" required>
    </div>
    <br>
    <button type="submit">Log in</button>
  </form>`);
}


// create post

function createPost(callback) {
  callback(null, `<h2>Create post</h2>
  <form action="/createpost" method="POST">
    <div>
      <input type="text" name="url" placeholder="Enter a URL to content" required>
    </div>
    <div>
      <input type="text" name="title" placeholder="Enter the title of your content" required>
    </div>
    
    <br>
    <button type="submit">Create post!</button>
  </form>`);
}

module.exports = {
  signup: signup,
  login: login,
  createPost: createPost
};