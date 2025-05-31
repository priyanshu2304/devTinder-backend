const express = require("express");
const appRouter = express.Router();
const { validateSignup, validateEmail } = require("../utils/validation");
const bcrypt = require("bcrypt");
const User = require("../models/user");

appRouter.post("/signup", async (req, res) => {
  try {
    validateSignup(req);
    const { email, password, firstName, lastName, skills, gender } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: passwordHash,
      firstName,
      lastName,
      skills,
      gender,
      photoUrl,
    });
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(404).send(`Error: ${error.message}`);
  }
});

appRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    validateEmail(email);
    const user = await User.findOne({ email: email });
    if (!user) {
      throw new Error("Invalid Credential");
    }

    const isPasswordVerified = await user.validatePassword(password);
    if (!isPasswordVerified) {
      throw new Error("Invalid Credential");
    }
    const token = await user.getJWT();
    if (user) {
      res.cookie("token", token, {
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.json(user);
    }
  } catch (error) {
    res.status(404).send(`Error: ${error.message}`);
  }
});

appRouter.post("/logout", async (req, res) => {
  try {
    res.clearCookie("token").send("User logged out");
  } catch (error) {
    res.status(404).send(`Error: ${error.message}`);
  }
});

module.exports = appRouter;
