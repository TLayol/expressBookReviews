const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (username && password) {
    if (!isValid(username)) { 
      users.push({"username":username,"password":password});
      return res.status(200).json({message: "Customer successfully registered. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});    
    }
  } 
  return res.status(404).json({message: "Unable to register user."});
});

// Lấy danh sách sách bằng Async/Await và mô phỏng Axios
public_users.get('/', async function (req, res) {
  try {
    const getBooks = () => {
      return new Promise((resolve, reject) => {
        resolve(books);
      });
    };
    const bookList = await getBooks();
    res.status(200).json({books: bookList});
  } catch (error) {
    res.status(500).json({message: "Error fetching books"});
  }
});

// Lấy sách theo ISBN bằng Promise
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  let bookPromise = new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject("Book not found");
    }
  });

  bookPromise.then((book) => {
    res.status(200).json(book);
  }).catch((error) => {
    res.status(404).json({message: error});
  });
});

// Lấy sách theo tác giả bằng Async/Await
public_users.get('/author/:author', async function (req, res) {
  try {
    const author = req.params.author;
    const fetchBooksByAuthor = () => {
      return new Promise((resolve, reject) => {
        let booksByAuthor = [];
        let isbns = Object.keys(books);
        isbns.forEach((isbn) => {
          if (books[isbn].author === author) {
            booksByAuthor.push({"isbn": isbn, "title": books[isbn].title, "reviews": books[isbn].reviews});
          }
        });
        resolve(booksByAuthor);
      });
    };

    const result = await fetchBooksByAuthor();
    res.status(200).json({booksbyauthor: result});
  } catch (error) {
    res.status(500).json({message: "Error retrieving books"});
  }
});

// Lấy sách theo tiêu đề bằng Promise
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  let titlePromise = new Promise((resolve, reject) => {
    let booksByTitle = [];
    let isbns = Object.keys(books);
    isbns.forEach((isbn) => {
      if (books[isbn].title === title) {
        booksByTitle.push({"isbn": isbn, "author": books[isbn].author, "reviews": books[isbn].reviews});
      }
    });
    resolve(booksByTitle);
  });

  titlePromise.then((result) => {
    res.status(200).json({booksbytitle: result});
  });
});

// Lấy review của sách
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    res.status(200).json(books[isbn].reviews);
  } else {
    res.status(404).json({message: "Book not found"});
  }
});

module.exports.general = public_users;
