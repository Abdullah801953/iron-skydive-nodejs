const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
require('dotenv').config();
const formSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  gender: {
    type: String,
    // required: true,
  },
  password: {
    type: String,
    required: true,
  },
  confirmPassword: {
    type: String,
    required: true,
  },
  phone: {
    type: Number,
    required: true,
    unique: true,
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

// genterting tocken
formSchema.methods.generatAuthToken = async function () {
  try {
    const tocken = jwt.sign(
      { _id: this._id},
     process.env.SECRET_KEY
    );
    this.tokens = this.tokens.concat({token:tocken});
    await this.save();
    console.log(tocken);
    return tocken;
  } catch (error) {
    console.log(erro);
  }
};

// middleware convert password into hash
formSchema.pre("save", async function (next) {
  try {
    // Check if the password field is modified
    if (this.isModified("password")) {
      console.log("Original password:", this.password);
      this.password = await bcryptjs.hash(this.password, 10);
      this.confirmPassword = await bcryptjs.hash(this.confirmPassword, 10);
      console.log("Hashed password:", this.password);
    }
    next();
  } catch (error) {
    next(error);
  }
});

const formModel = new mongoose.model("form", formSchema);
module.exports = formModel;
