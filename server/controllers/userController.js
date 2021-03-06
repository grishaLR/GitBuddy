const fetch = require('node-fetch');
const db = require('../buddyModels');
const Octokat = require('octokat');
const octo = new Octokat({ token: 'b00a94451c1b2a5dd2cb8dcde81c4264ad3b1474' });
const session = require('express-session');

const userController = {};

userController.getUser = (req, res, next) => {
  //check db if user in database
  //console.log("res locals: ", res.locals);
  const queryToGet = {
    text: 'SELECT * FROM users WHERE github_user_id = $1',
    values: [`${res.locals.user.id}`],
  };
  db.query(queryToGet, (err, result) => {
    //console.log("result: ", result);
    //console.log('ROWS', result.rows)
    if (result.rows.length === 0) {
      return next();
    } else if (err) {
      return next({
        message: 'Error getting users',
        error: err,
      });
    } else {
      // console.log(result.rows)
      res.locals.user = result.rows[0];
      res.locals.userFound = true;
      //return res.json(res.locals.user);
      return next();
    }
  });
};
// userController.githubApi = (req, res, next) => {
//   res.locals.userId = '5877145'
//   const token = `b00a94451c1b2a5dd2cb8dcde81c4264ad3b1474`
//   fetch(`https://api.github.com/user/${res.locals.userId}`, {
//     headers: {Authorization: `token ${token}`}
//   })
//     .then(res => res.json())
//     .then(json => {console.log(json)})
//     .then((data) => {return next()});

//   // octo
//   //   .user("5877145").fetch()
//   //   .then((data) => {
//   //     console.log(data)
//   //     return next();
//   //   });
// };

userController.createUser = (req, res, next) => {
  if (res.locals.userFound === true) return next();
  const user = res.locals.user;
  const queryToCreate = {
    text: `INSERT INTO users (github_url, github_followers_url, github_repos_url, name, github_email, github_twitter_username, github_user_id, github_login) 
    VALUES($1, $2, $3, $4, $5, $6, $7, $8)`, //i believe user_is is automatically generated
    values: [
      user.html_url,
      user.followers_url,
      user.repos_url,
      user.name,
      user.email,
      user.twitter_username,
      user.id,
      user.login,
    ],
  };
  db.query(queryToCreate, (err, result) => {
    if (err)
      return next({
        message: 'Error creating user',
        error: err,
      });
    else {
      console.log('User entry worked!--------------------------------');
      res.locals.user = result.rows[0];
      return next();
      // return res.json(res.locals.user);
    }
  });
};

userController.getRepos = (req, res, next) => {

  fetch(res.locals.user.github_repos_url,
    {headers: {Authorization: `token ${req.cookies.SSID}`}

    })
    .then(data => data.json())
    .then(data => {
      // console.log(data);
      //need to populate sequel DB with result?/////////////////////////////////////////////////////////////////////////////////////////////////
      //parse data and grab name of each repo
      const arrOfRepos = data.map(repoObj => {        
        return {
          name: repoObj.name,
          //need to send watchers_url or stargazers_url instead of subscribers_url
          stargazersUrl: repoObj.stargazers_url
        };
      });     
      res.locals.userWithRepos = {
        user: res.locals.user,
        repos: arrOfRepos
      };
  
      return next();      
    })
    .catch(err => {
      return next({
        message: 'Error getting repos in repoController.getRepos',
        error: err
      });
    });
};



//authtoken for test
const authToken = 'f84ac2bb74b46593d71490af2c46dcc6cc67b578';
userController.getUserInfoFromRepos = (req, res, next) => {
  console.log('req.body.urls===============', req.body);
  const array = req.body.urls;

  //NEED TO INCLUDE AUTHORIZATION IN ALL FETCH REQUESTS TO PREVENT API TIMING OUT

  const arrayOfFetch = array.map(url => 
    //some logic to check if repo is in database
  //
    fetch(url,{
      headers: {Authorization: `token ${req.cookies.SSID}`}
    }
      //for test use authToken
      //{Authorization: `token ${authToken}`}
      // {Authorization: `token ${req.cookies.SSID}`}
    )
      .then(data => data.json())
  );
  //console.log(arrayOfFetch);
  Promise.all(arrayOfFetch)
    .then(data => {
      res.locals.userUrls = data.flat().map(userinfo => userinfo.url);
      return next();
    })
    .catch(err=> {
      return next({
        message: 'Error resolving multiple promises in userController.getUserInfoFromRepos',
        error: err,
      });
    });
};


userController.getMultipleUsersInfo = (req, res, next) => {
  let array;
  if (res.locals.userUrls) array = res.locals.userUrls;
  else array = req.body.urls;
  //to make up for duplicates
  array = [...new Set(array)];

  console.log(`req body===================`, req.body)

  const arrayOfFetch = array.map(url => 
    fetch(url, {
      headers: {Authorization: `token ${req.cookies.SSID}`}
    })
      .then(data => data.json())
  );

  Promise.all(arrayOfFetch)
    .then(data => {
      const listOfUsersAndEmails = data.slice(0, data.length).map(obj => {
        return {
          user: obj.login,
          email: obj.email
        };
      });
      res.locals.listOfUsersAndEmails = listOfUsersAndEmails;
      //console.log(listOfUsersAndEmails);
      return next();
    });
};

module.exports = userController;
