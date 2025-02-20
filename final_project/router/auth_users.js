const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  if (!username) {
    return false;
  }
  return !users.some(user => user.username === username);
}

const authenticatedUser = (username, password) => {
  for (let user of users) {
    if (username === user.username && password === user.password)
      return true;
  }
  return false;
}

regd_users.post("/login", (req, res) => {
  let { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }
  if (authenticatedUser(username, password)) {
    const token = jwt.sign({ username }, "fingerprint_customer", { expiresIn: "1h" });
    req.session.authorization = { accessToken: token, username: username };
    return res.status(200).json({ token });
  }
  return res.status(401).json({ message: "Invalid Credentials" });
});

regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review; // Extract review from query params
  const username = req.session.authorization?.username;

  console.log("Query Params:", req.query);
  console.log("Review received:", review);

  if (!review) {
    return res.status(400).json({ error: "Review content is required" });
  }

  if (!username) {
    return res.status(403).json({ error: "User not logged in" });
  }

  if (!books[isbn]) {
    return res.status(404).json({ error: "Book not found" });
  }

  if (!books[isbn].reviews) {
    books[isbn].reviews = {};
  }

  books[isbn].reviews[username] = review;

  return res.status(200).json({
    message: "Review added/updated successfully",
    reviews: books[isbn].reviews
  });
});



regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  // Check if the book exists
  if (!books[isbn]) {
    return res.status(404).json({ error: "Book not found" });
  }

  // Check if the user has a review for this book
  if (!books[isbn].reviews || !books[isbn].reviews[username]) {
    return res.status(404).json({ error: "Review not found for this user" });
  }

  // Delete the review
  delete books[isbn].reviews[username];

  // Return success message
  return res.status(200).json({
    message: "Review deleted successfully",
    reviews: books[isbn].reviews
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;