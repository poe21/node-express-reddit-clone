var bcrypt = require('bcrypt');
var HASH_ROUNDS = 10;
var secureRandom = require('secure-random');

function createSessionToken() {
  return secureRandom.randomArray(100).map(code => code.toString(36)).join("");
}

/* to do:
- account page?
- subreddits?
- pages?
- spinning picture
- posts links?
*/

module.exports = function RedditAPI(conn) {
  return {
    createUser: function(user, callback) {
      
      bcrypt.hash(user.password, HASH_ROUNDS, function(err, hashedPassword) {
        if (err) {
          callback(err);
        }
        else {
          conn.query(
            'INSERT INTO `users` (`username`,`password`, `createdAt`) VALUES (?, ?, ?)', [user.username, hashedPassword, null],
            function(err, result) {
              if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                  callback(new Error('A user with this username already exists'));
                }
                else {
                  callback(err);
                }
              }
              else {
                conn.query(
                  'SELECT `id`, `username`, `createdAt`, `updatedAt` FROM `users` WHERE `id` = ?', [result.insertId],
                  function(err, result) {
                    if (err) {
                      callback(err);
                    }
                    else {
                      callback(null, result[0]);
                    }
                  }
                );
              }
            }
          );
        }
      });
    },
    checkLogin: function(user, password, callback) {
      conn.query('SELECT * FROM users WHERE username=?', [user], 
      function(err, result) {
        if (result.length === 0) {
          callback(new Error('Username or password incorrect'));
        } else {
          var user = result[0];
          var actualHashedPassword = user.password;
          bcrypt.compare(password, actualHashedPassword, function(err, result) {
            if(result === true) {
              callback(null, user);
            }
            else {
              callback(new Error('Username or password incorrect'));
            }
          });
        }
      });
    },
    createSession: function(userId, callback) {
      var token = createSessionToken();
      conn.query(`INSERT INTO sessions SET userId=?, token=?`, [userId, token], 
        function(err, result) {
          if (err) {
            callback(err);
          } else {
            callback(null, token);
          }
        }
      );
    },
    getUserFromSession: function(cookie, callback) {
      conn.query(`SELECT * FROM sessions WHERE token=?`, [cookie], 
        function(err, result) {
          if (result.length === 0) {
            callback(err);
          } else {
            var user = result[0];
            callback(null, user);
          }
        }
      );
    },
    logOut: function(userId, token, callback) {
      conn.query(`DELETE FROM sessions WHERE userId=? AND token=? LIMIT 1`, [userId, token],
        function(err, result) {
          if (err) {
            callback(err);
          }
          else {
            callback(null, result);
          }
        }
      );
    },
    createPost: function(post, callback) {
      conn.query(
        'INSERT INTO `posts` (`title`, `url`, `userId`, `createdAt`) VALUES (?, ?, ?, ?)', [post.title, post.url, post.userId, null],
        function(err, result) {
          if (err) {
            callback(err);
          }
          else {
            callback(null, result);
          }
        }
      );
    },
    getHomepage: function(options, callback) {
      // In case we are called without an options parameter, shift all the parameters manually
      if (!callback) {
        callback = options;
        options = {};
      }
      var limit = options.numPerPage || 25; // if options.numPerPage is "falsy" then use 25
      var offset = (options.page || 0) * limit;

      conn.query(`
        SELECT p.id AS post_id, p.title AS post_title, p.url AS post_url, p.userId AS post_userId, 
          p.createdAt AS post_createdAt, p.updatedAt AS post_updatedAt, u.id AS user_id, u.username AS user_username,
          TIMESTAMPDIFF(HOUR, p.createdAt, CURRENT_TIMESTAMP) AS daysSinceCreation,
          SUM(IFNULL(v.vote,0)) AS voteScore,
          ((SUM(IFNULL(v.vote,0))) / (TIMESTAMPDIFF(HOUR, p.createdAt, CURRENT_TIMESTAMP))) AS hotnessRanking
        FROM posts p
        LEFT JOIN subreddits s ON p.subredditId=s.id
        LEFT JOIN users u ON p.userId=u.id
        LEFT JOIN votes v ON v.postId=p.id
        GROUP BY p.id
        ORDER BY hotnessRanking DESC
        LIMIT ? OFFSET ?
        `, [limit, offset],
        function(err, results) {
          if (err) {
            callback(err);
          }
          else {
            var postsArray = [];
            var newPostObj = {};
            results.map(function(postObj) {
              newPostObj = {
                postId: postObj.post_id,
                title: postObj.post_title,
                url: postObj.post_url,
                createdAt: postObj.post_createdAt,
                updatedAt: postObj.post_updatedAt,
                userId: postObj.post_userId,
                totalVotes: postObj.voteScore,
                subreddit: {
                  subredditId: postObj.subreddit_id,
                  name: postObj.subreddit_name,
                  description: postObj.subreddit_description,
                  createdAt: postObj.subreddit_createdAt,
                  updatedAt: postObj.subreddit_updatedAt
                },
                user: {
                  userId: postObj.user_id,
                  username: postObj.user_username,
                  createdAt: postObj.user_createdAt,
                  updatedAt: postObj.user_updatedAt
                }
              };
              postsArray.push(newPostObj);
            });
            callback(null, postsArray);
          }
        }
      );
    },
    castOrUpdateVote: function(vote, callback) {
      conn.query(
      `INSERT INTO votes SET postId=${Number(vote.postId)}, userId=${vote.userId}, createdAt=${null}, vote=${Number(vote.vote)} ON DUPLICATE KEY UPDATE vote=${Number(vote.vote)}`,
      function(err, result) {
        if (err) {
          callback(err);
        }
        else {
          callback(null, result);
        }
      });
    },
    getSortedHomepage: function(sort, options, callback) {
      if (!callback) {
        callback = options;
        options = {};
      }
      var limit = options.numPerPage || 25; // if options.numPerPage is "falsy" then use 25
      var offset = (options.page || 0) * limit;
      
      if (sort === "new") {
        conn.query(`
          SELECT p.id AS post_id, p.title AS post_title, p.url AS post_url, p.userId AS post_userId, 
            p.createdAt AS post_createdAt, p.updatedAt AS post_updatedAt, s.id AS subreddit_id,
            s.name AS subreddit_name, s.description AS subreddit_description, s.createdAt AS subreddit_createdAt,
            s.updatedAt AS subreddit_updatedAt, u.id AS user_id, u.username AS user_username, 
            u.createdAt AS user_createdAt, u.updatedAt AS user_updatedAt
          FROM posts p
          LEFT JOIN subreddits s ON p.subredditId=s.id
          LEFT JOIN users u ON p.userId=u.id
          ORDER BY p.createdAt DESC
          LIMIT ? OFFSET ?
          `, [limit, offset],
          function(err, results) {
            if (err) {
              callback(err);
            }
            else {
              var postsArray = [];
              var newPostObj = {};
              results.map(function(postObj) {
                newPostObj = {
                  postId: postObj.post_id,
                  title: postObj.post_title,
                  url: postObj.post_url,
                  createdAt: postObj.post_createdAt,
                  updatedAt: postObj.post_updatedAt,
                  userId: postObj.post_userId,
                  totalVotes: postObj.voteScore,
                  subreddit: {
                    subredditId: postObj.subreddit_id,
                    name: postObj.subreddit_name,
                    description: postObj.subreddit_description,
                    createdAt: postObj.subreddit_createdAt,
                    updatedAt: postObj.subreddit_updatedAt
                  },
                  user: {
                    userId: postObj.user_id,
                    username: postObj.user_username,
                    createdAt: postObj.user_createdAt,
                    updatedAt: postObj.user_updatedAt
                  }
                };
                postsArray.push(newPostObj);
              });
              callback(null, postsArray);
            }
          }
        );
      } else if (sort === "top") {
        conn.query(`
          SELECT p.id AS post_id, p.title AS post_title, p.url AS post_url, p.userId AS post_userId, 
            p.createdAt AS post_createdAt, p.updatedAt AS post_updatedAt, s.id AS subreddit_id,
            s.name AS subreddit_name, s.description AS subreddit_description, s.createdAt AS subreddit_createdAt,
            s.updatedAt AS subreddit_updatedAt, u.id AS user_id, u.username AS user_username, 
            u.createdAt AS user_createdAt, u.updatedAt AS user_updatedAt, SUM(IFNULL(v.vote,0)) AS voteScore
          FROM posts p
          LEFT JOIN subreddits s ON p.subredditId=s.id
          LEFT JOIN users u ON p.userId=u.id
          LEFT JOIN votes v ON v.postId=p.id
          GROUP BY p.id
          ORDER BY voteScore DESC
          LIMIT ? OFFSET ?
          `, [limit, offset],
          function(err, results) {
            if (err) {
              callback(err);
            }
            else {
              var postsArray = [];
              var newPostObj = {};
              results.map(function(postObj) {
                newPostObj = {
                  postId: postObj.post_id,
                  title: postObj.post_title,
                  url: postObj.post_url,
                  createdAt: postObj.post_createdAt,
                  updatedAt: postObj.post_updatedAt,
                  userId: postObj.post_userId,
                  totalVotes: postObj.voteScore,
                  subreddit: {
                    subredditId: postObj.subreddit_id,
                    name: postObj.subreddit_name,
                    description: postObj.subreddit_description,
                    createdAt: postObj.subreddit_createdAt,
                    updatedAt: postObj.subreddit_updatedAt
                  },
                  user: {
                    userId: postObj.user_id,
                    username: postObj.user_username,
                    createdAt: postObj.user_createdAt,
                    updatedAt: postObj.user_updatedAt
                  }
                };
                postsArray.push(newPostObj);
              });
              callback(null, postsArray);
            }
          }
        );
      } else if (sort === "hot") {  // I would normally set timestampdiff for seconds, but considering the amount of data, i set it to hours for now
        conn.query(`
          SELECT p.id AS post_id, p.title AS post_title, p.url AS post_url, p.userId AS post_userId, 
            p.createdAt AS post_createdAt, p.updatedAt AS post_updatedAt, u.id AS user_id, u.username AS user_username,
            TIMESTAMPDIFF(HOUR, p.createdAt, CURRENT_TIMESTAMP) AS daysSinceCreation,
            SUM(IFNULL(v.vote,0)) AS voteScore,
            ((SUM(IFNULL(v.vote,0))) / (TIMESTAMPDIFF(HOUR, p.createdAt, CURRENT_TIMESTAMP))) AS hotnessRanking
          FROM posts p
          LEFT JOIN subreddits s ON p.subredditId=s.id
          LEFT JOIN users u ON p.userId=u.id
          LEFT JOIN votes v ON v.postId=p.id
          GROUP BY p.id
          ORDER BY hotnessRanking DESC
          LIMIT ? OFFSET ?
          `, [limit, offset],
          function(err, results) {
            if (err) {
              callback(err);
            }
            else {
              var postsArray = [];
              var newPostObj = {};
              results.map(function(postObj) {
                newPostObj = {
                  postId: postObj.post_id,
                  title: postObj.post_title,
                  url: postObj.post_url,
                  createdAt: postObj.post_createdAt,
                  updatedAt: postObj.post_updatedAt,
                  userId: postObj.post_userId,
                  totalVotes: postObj.voteScore,
                  subreddit: {
                    subredditId: postObj.subreddit_id,
                    name: postObj.subreddit_name,
                    description: postObj.subreddit_description,
                    createdAt: postObj.subreddit_createdAt,
                    updatedAt: postObj.subreddit_updatedAt
                  },
                  user: {
                    userId: postObj.user_id,
                    username: postObj.user_username,
                    createdAt: postObj.user_createdAt,
                    updatedAt: postObj.user_updatedAt
                  }
                };
                postsArray.push(newPostObj);
              });
              callback(null, postsArray);
            }
          }
        );
      } else if (sort === "controversial") {  // for now showing all posts with votes since not enough entries in database
        conn.query(`
          SELECT p.id AS post_id, p.title AS post_title, p.url AS post_url, p.userId AS post_userId, 
            p.createdAt AS post_createdAt, p.updatedAt AS post_updatedAt, s.id AS subreddit_id,
            s.name AS subreddit_name, s.description AS subreddit_description, s.createdAt AS subreddit_createdAt,
            s.updatedAt AS subreddit_updatedAt, u.id AS user_id, u.username AS user_username, 
            u.createdAt AS user_createdAt, u.updatedAt AS user_updatedAt,
            count(vote) AS votesTotal, SUM(IFNULL(v.vote, 0)) AS voteScore,
            SUM(CASE v.vote WHEN 1 THEN 1 ELSE 0 END) AS numUpvotes,
            SUM(CASE v.vote WHEN -1 THEN 1 ELSE 0 END) AS numDownvotes,
            IF(SUM(IF(vote>0,1,0))<SUM(IF(vote<0,1,0)),SUM(IF(vote>0,1,0))/SUM(IF(vote<0,1,0))*count(vote), SUM(IF(vote<0,1,0))/SUM(IF(vote>0,1,0))) AS controversialRanking
          FROM posts p
          LEFT JOIN subreddits s ON p.subredditId=s.id
          LEFT JOIN users u ON p.userId=u.id
          JOIN votes v ON v.postId=p.id
          GROUP BY p.id
          ORDER BY controversialRanking DESC
          LIMIT ? OFFSET ?
          `, [limit, offset],
          function(err, results) {
            if (err) {
              callback(err);
            }
            else {
              var postsArray = [];
              var newPostObj = {};
              results.map(function(postObj) {
                newPostObj = {
                  postId: postObj.post_id,
                  title: postObj.post_title,
                  url: postObj.post_url,
                  createdAt: postObj.post_createdAt,
                  updatedAt: postObj.post_updatedAt,
                  userId: postObj.post_userId,
                  totalVotes: postObj.voteScore,
                  subreddit: {
                    subredditId: postObj.subreddit_id,
                    name: postObj.subreddit_name,
                    description: postObj.subreddit_description,
                    createdAt: postObj.subreddit_createdAt,
                    updatedAt: postObj.subreddit_updatedAt
                  },
                  user: {
                    userId: postObj.user_id,
                    username: postObj.user_username,
                    createdAt: postObj.user_createdAt,
                    updatedAt: postObj.user_updatedAt
                  }
                };
                postsArray.push(newPostObj);
              });
              callback(null, postsArray);
            }
          }
        );
      }
    }
  };
};