const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const FormData = require("./model/form");
const hbs = require("hbs");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const auth = require("../server/middleware/auth");
const { clear } = require("console");

const port = process.env.PORT || 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// static path surved
const staticPath = path.join(__dirname, "../client");
const viewsPath = path.join(__dirname, "../client/templates/views");
const partialsPath = path.join(__dirname, "../client/templates/partials");

app.use(express.static(staticPath));
app.set("view engine", "hbs");

app.set("views", viewsPath);
hbs.registerPartials(partialsPath);
// express connection
app.get("/", async (req, res) => {
  res.render("home");
});
app.get("/secret", auth, async (req, res) => {
  console.log(`this is secret tocken ${req.cookies.jwt}`);
  res.render("secret");
});
app.get("/registration", async (req, res) => {
  res.render("index");
});
app.get("/login", async (req, res) => {
  res.render("login");
});
app.get("/logout", auth, async (req, res) => {
  try {
    // for single logout
    // req.user.tokens = req.user.tokens.filter((currElement) => {
    //   return currElement.token != req.token;
    // });

    // logout from all devices
    req.user.tokens = [];
    

    res.clearCookie("jwt");
    console.log("logout successfully");
    await req.user.save();
    res.render("login");
  } catch (error) {
    res.status(500).send(error);
  }
});
app.listen(port, () => {
  console.log(`listen from port ${port}`);
});

// database registration
app.post("/registration", async (req, res) => {
  try {
    let password = req.body.password;
    let cpassword = req.body.confirmpassword;
    if (password === cpassword) {
      const data = new FormData({
        firstName: req.body.firstname,
        lastName: req.body.lastname,
        email: req.body.email,
        gender: req.body.gender,
        password: req.body.password,
        confirmPassword: req.body.confirmpassword,
        phone: req.body.phone,
      });

      const saveData = await data.save();
      res.status(201).render("index");
    } else {
      res.send("password is not matching");
    }
  } catch (err) {
    console.log(err);
  }
});

// login
app.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;
    const userEmail = await FormData.findOne({ email: email });
    const match = await bcryptjs.compare(password, userEmail.password);

    if (match) {
      // Generate authentication token
      const token = await userEmail.generatAuthToken();

      // Store the token in cookies
      res.cookie("jwt", token, {
        expires: new Date(Date.now() + 900000), // 15 minutes
        httpOnly: true,
      });
      res.render("home");
    } else {
      res.send("password not match");
      console.log(password);
      console.log(userEmail.password);
    }
  } catch (error) {
    res.status(400).send("invalid email");
  }
});

// database connection
const databaseConnection = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/Registration");
    console.log("connected to databse");
  } catch (err) {
    console.log("failed to connect with database", err);
  }
};
databaseConnection();
