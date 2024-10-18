const jwt = require("jsonwebtoken");
const Form = require("../model/form");
require("dotenv").config();

const auth = async (req, res, next) => {
  try {
    const token = req.cookies.jwt; // Check if the token is present
    if (!token) {
      return res.status(401).send("Access denied. No token provided."); // If no token, respond with 401
    }

    // Verify the token
    const verifyUser = jwt.verify(token, process.env.SECRET_KEY);
    console.log(verifyUser);

    // Find the user based on the verified ID
    const user = await Form.findOne({ _id: verifyUser._id });
    if (!user) {
      return res.status(404).send("User not found."); // If user not found, respond with 404
    }

    // Attach token and user to the request object
    req.token = token;
    req.user = user;
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error("Authentication error:", error); // Log the error for debugging
    res.status(401).send("Invalid token."); // Respond with 401 for any verification errors
  }
};

module.exports = auth;
