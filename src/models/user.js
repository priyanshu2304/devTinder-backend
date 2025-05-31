const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { Schema } = mongoose;

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 50,
    },
    lastName: {
      type: String,
      minLength: 3,
      maxLength: 50,
    },
    password: {
      type: String,
      validate(value) {
        if (
          !validator.isStrongPassword(value, {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
          })
        ) {
          throw new Error(
            "Password must be at least 8 characters and include uppercase, lowercase, number, and symbol."
          );
        }
      },
    },
    age: {
      type: Number,
      minLength: 18,
    },
    photoUrl: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email is not valid");
        }
      },
    },
    gender: {
      type: String,
      validate(value) {
        if (!["male", "female", "other"].includes(value)) {
          throw new Error("Gender Validation failed");
        }
      },
      lowercase: true,
    },
    skills: {
      type: [String],
    },
    about: {
      type: String,
      default: "This is all about me",
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.getJWT = async function () {
  const user = this;
  const token = await jwt.sign({ _id: user._id }, "Priyanshu@123", {
    expiresIn: "1d",
  });
  return token;
};

userSchema.methods.validatePassword = async function (passwordByUser) {
  const user = this;
  const passwordHash = user.password;
  const isPasswordVerified = await bcrypt.compare(passwordByUser, passwordHash);
  return isPasswordVerified;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
