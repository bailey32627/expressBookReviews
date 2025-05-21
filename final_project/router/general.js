const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Log for debugging
  console.log("Register attempt:", username, password);

  if (username && password) {
    if (!isValid(username)) {
      users.push({ username, password });
      return res.status(200).json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(400).json({ message: "User already exists!" });
    }
  }

  return res.status(400).json({ message: "Username and password are required." });
});

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {
    // Simulate an asynchronous operation (e.g., fetching from DB)
    const allBooks = await new Promise((resolve) => resolve(books));

    res.send(JSON.stringify(allBooks));
  } catch (error) {
    res.status(500).json({ message: "Failed to retrieve books", error: error.message });
  }
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  getBookByISBN(isbn)
    .then((book) => {
      res.send(book);
    })
    .catch((err) => {
      res.status(404).send(err.message);
    });
});

// helper function that returns a Promise
function getBookByISBN(isbn) {
  return new Promise( (resolve, reject ) =>{
    if( books[isbn]) {
      resolve( books[ isbn ] );
    } else {
      reject( new Error("Book not found." ) );
    }
  })
}

// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const authorQuery = req.params.author.toLowerCase();

  getBooksByAuthor(authorQuery)
    .then(results => {
      if (results.length > 0) {
        res.json(results);
      } else {
        res.status(404).send("No books found by that author.");
      }
    })
    .catch(error => {
      res.status(500).json({ message: "Error retrieving books", error: error.message });
    });
});

function getBooksByAuthor(author) {
  return new Promise((resolve, reject) => {
    const results = Object.values(books).filter(book =>
      book.author.toLowerCase().includes(author)
    );
    resolve(results); // or reject(err) if simulating failure
  });
}

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const titleQuery = req.params.title.toLowerCase();

  getBooksByTitle(titleQuery)
    .then(results => {
      if (results.length > 0) {
        res.json(results);
      } else {
        res.status(404).json({ message: "No books found by that title." });
      }
    })
    .catch(error => {
      res.status(500).json({ message: "Error retrieving books", error: error.message });
    });
});

// Helper function that returns a Promise
function getBooksByTitle(title) {
  return new Promise((resolve, reject) => {
    const results = Object.values(books).filter(book =>
      book.title.toLowerCase().includes(title)
    );

    resolve(results);
  });
}

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const book = books[ req.params.isbn ];
  if( book ) {
    res.json( book.reviews );
  } else {
    res.status( 404 ).json({ message: "Book not found." } );
  }
});

module.exports.general = public_users;
