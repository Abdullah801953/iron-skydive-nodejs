const mongoose = require("mongoose");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
require('dotenv').config();
const formSchema = new mongoose.Schema({
  firstName: {
    type: String,
    require: true,
  },
  lastName: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    require: true,
    unique: true,
  },
  gender: {
    type: String,
    require: true,
  },
  password: {
    type: String,
    require: true,
  },
  confirmPassword: {
    type: String,
    require: true,
  },
  phone: {
    type: Number,
    require: true,
    unique: true,
  },
  tokens: [
    {
      token: {
        type: String,
        require: true,
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
