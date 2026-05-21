const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios'); // Bắt buộc phải có

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

// Task 1: Lấy danh sách sách
public_users.get('/', function (req, res) {
  res.send(JSON.stringify(books, null, 4));
});

// Task 2: Lấy sách theo ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  res.send(books[isbn]);
});
  
// Task 3: Lấy sách theo tác giả
public_users.get('/author/:author', function (req, res) {
  let ans = []
  for(const [key, values] of Object.entries(books)){
      const book = Object.entries(values);
      for(let i = 0; i < book.length ; i++){
          if(book[i][0] == 'author' && book[i][1] == req.params.author){
              ans.push(books[key]);
          }
      }
  }
  if(ans.length == 0){
      return res.status(300).json({message: "Author not found"});
  }
  res.send(ans);
});

// Task 4: Lấy sách theo tiêu đề
public_users.get('/title/:title', function (req, res) {
  let ans = []
  for(const [key, values] of Object.entries(books)){
      const book = Object.entries(values);
      for(let i = 0; i < book.length ; i++){
          if(book[i][0] == 'title' && book[i][1] == req.params.title){
              ans.push(books[key]);
          }
      }
  }
  if(ans.length == 0){
      return res.status(300).json({message: "Title not found"});
  }
  res.send(ans);
});

// Task 5: Lấy review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  res.send(books[isbn].reviews);
});

// --- PHẦN CODE CHO TASK 11 (AXIOS & PROMISES) ---

// Get all books using Async/Await and Axios
public_users.get('/async-get-books', async function (req, res) {
    try {
        const response = await axios.get('http://localhost:5000/');
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({message: "Error fetching books"});
    }
});

// Get book details by ISBN using Promises and Axios
public_users.get('/promise-get-isbn/:isbn', function (req, res) {
    axios.get(`http://localhost:5000/isbn/${req.params.isbn}`)
    .then(response => {
        res.status(200).json(response.data);
    })
    .catch(error => {
        res.status(500).json({message: "Error fetching book details"});
    });
});

// Get book details by Author using Async/Await and Axios
public_users.get('/async-get-author/:author', async function (req, res) {
    try {
        const response = await axios.get(`http://localhost:5000/author/${req.params.author}`);
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({message: "Error fetching book details"});
    }
});

// Get book details by Title using Async/Await and Axios
public_users.get('/async-get-title/:title', async function (req, res) {
    try {
        const response = await axios.get(`http://localhost:5000/title/${req.params.title}`);
        res.status(200).json(response.data);
    } catch (error) {
        res.status(500).json({message: "Error fetching book details"});
    }
});

module.exports.general = public_users;
