const express = require("express");
const axios = require("axios"); // Import Axios
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Register a new user
public_users.post("/register", (req, res) => {
  let registeringUser = req.body;
  if (!registeringUser.username || !registeringUser.password)
    return res.status(400).json({ error: "Username or Password are empty" });

  for (let user of users) {
    if (registeringUser.username === user.username)
      return res.status(409).json({ error: "Username already taken" });
  }
  
  users.push(registeringUser);
  return res.status(200).json({ message: "User registered successfully!" });
});

// Task 10: Get the book list available in the shop (Async-Await)
public_users.get("/", async (req, res) => {
  try {
    const response = await axios.get("http://localhost:5000/books");
    return res.status(200).json({ books: response.data });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch books" });
  }
});

// Task 11: Get book details based on ISBN (Async-Await)
public_users.get("/isbn/:isbn", async (req, res) => {
  let isbn = req.params.isbn;
  try {
    const response = await axios.get(`http://localhost:5000/books/${isbn}`);
    return res.status(200).json({ searchedBook: response.data });
  } catch (error) {
    return res.status(404).json({ message: "No data found" });
  }
});

// Task 12: Get book details based on author (Using Promises)
public_users.get("/author/:author", (req, res) => {
  let author = req.params.author;
  
  axios.get("http://localhost:5000/books")
    .then((response) => {
      let searchedBooks = [];
      for (const isbn in response.data) {
        if (response.data[isbn].author === author)
          searchedBooks.push(response.data[isbn]);
      }
      
      if (searchedBooks.length)
        return res.status(200).json({ searchedBooks: searchedBooks });
      return res.status(404).json({ message: "No books found for this author" });
    })
    .catch(() => {
      return res.status(500).json({ error: "Failed to fetch books" });
    });
});

// Task 13: Get all books based on title (Using Promises)
public_users.get("/title/:title", (req, res) => {
  let title = req.params.title;
  
  axios.get("http://localhost:5000/books")
    .then((response) => {
      let searchedBook = null;
      for (const isbn in response.data) {
        if (response.data[isbn].title === title)
          searchedBook = response.data[isbn];
      }
      
      if (searchedBook)
        return res.status(200).json({ searchedBook: searchedBook });
      return res.status(404).json({ message: "No book found with this title" });
    })
    .catch(() => {
      return res.status(500).json({ error: "Failed to fetch books" });
    });
});

// Get book review
public_users.get("/review/:isbn", (req, res) => {
  let isbn = req.params.isbn;
  let searchedBook = books[isbn];

  if (searchedBook)
    return res.status(200).json({ reviews: searchedBook.reviews });
  return res.status(404).json({ message: "No data found" });
});

module.exports.general = public_users;
