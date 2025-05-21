const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [
  { username: "Brad", password: "test" }
];

const isValid = (username)=>{ //returns boolean
  return users.some(user => user.username === username);
}

const authenticatedUser = (username,password)=>{ //returns boolean
  let validusers = users.filter( (user) => {
    return (user.username === username && user.password === password );
  });
  if( validusers.length > 0 ){
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if( !username || !password ) {
    return res.status(404).json( {message: "Error logging In."} );
  }

  // Authenticate user
  if( authenticatedUser( username, password ) ) {
    // generate JWT access token
    let accessToken = jwt.sign( {
      data: password
    }, 'access', { expiresIn: 60 * 60 });

    // store access token and username in session
    req.session.authorization = {
      accessToken, username
    }
    return res.status( 200 ).send( "User successfully logged In." );
  } else {
    return res.status( 208 ).json( {message: "Invalid Login. Check username and password." } );
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const review = req.body.review;
  const isbn = req.params.isbn;
  const book = books[isbn];
  const username = req.session.authorization?.username;

  if (!book) {
    return res.status(404).json({ message: "Book not found." });
  }

  if (!review) {
    return res.status(400).json({ message: "Review cannot be empty." });
  }

  if (!username) {
    return res.status(403).json({ message: "User not authenticated." });
  }

  book.reviews[username] = review;

  return res.status(200).json({ message: "Review successfully added/updated." });
});


regd_users.delete( "/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const book = books[isbn];
  const username = req.session.authorization?.username;

  if (!book) {
    return res.status(404).json({ message: "Book not found." });
  }

  if (!username) {
    return res.status(403).json({ message: "User not authenticated." });
  }

  if( !book.reviews[ username ] ) {
    return res.status(404).json( { message: "No review found for this user." } );
  }

  delete book.reviews[ username ];

  return res.status(200).json( {message: "Review deleted successfully" } );
})

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
