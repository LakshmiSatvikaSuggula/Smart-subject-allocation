// generateToken.js
const jwt = require("jsonwebtoken");

// Replace this with the same secret used in your backend (from .env)
const SECRET_KEY = "enlightenment";

// Create a sample faculty token
const token = jwt.sign(
  {
    id: "12345",
    name: "Test Faculty",
    role: "faculty",
  },
  SECRET_KEY,
  { expiresIn: "1h" } // valid for 1 hour
);

console.log("✅ Generated JWT Token:\n");
console.log(token);
