// sign up

function signup(callback) {
  callback(null, `
  <div class="form">
    <div class="form-wrapper">
      <h2>Sign Up</h2>
      <form action="/signup" method="POST">
        <input type="text" name="username" placeholder="Enter a username" required>
        <input type="password" name="password" placeholder="Enter a password" required>
        <button type="submit">Sign Up</button>
      </form>
    </div>
  </div>`);
}


// log in

function login(callback) {
  callback(null, `
  <div class="form">
    <div class="form-wrapper">
      <h2>Log in</h2>
      <form action="/login" method="POST">
        <input type="text" name="username" placeholder="Enter a username" required>
        <input type="password" name="password" placeholder="Enter a password" required>
        <button type="submit">Log in</button>
      </form>
    </div>
  </div>`);
}


// create post

function createPost(callback) {
  callback(null, `
  <div class="form">
    <div class="form-wrapper">
      <h2>Create post</h2>
      <form action="/createpost" method="POST">
        <input class="url" type="text" name="url" placeholder="Enter a URL" required>
        <input class="title" type="text" name="title" placeholder="Enter the title or click on Suggest title" required>
        <div class="buttonSet">
          <button class="suggest-title" type="button">Suggest title</button>
          <button class="create-post-button" type="submit">Create post!</button>
        </div>
        <div id="spinner"></div>
      </div>
    </form>
  </div>`);
}

module.exports = {
  signup: signup,
  login: login,
  createPost: createPost
};