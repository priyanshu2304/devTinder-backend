const express = require("express");
const { userAuthorized } = require("../middlewares/auth");
const {
  validateEditField,
  validateEditPassword,
} = require("../utils/validation");
const bcrypt = require("bcrypt");
const profileRouter = express.Router();

profileRouter.get("/profile/view", userAuthorized, async (req, res) => {
  try {
    const userProfile = req.user;
    res.send(userProfile);
  } catch (error) {
    res.status(404).send(`Error: ${error.message}`);
  }
});

profileRouter.patch("/profile/edit", userAuthorized, async (req, res) => {
  try {
    validateEditField(req.body);
    const loggedInUser = req.user;

    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));
    await loggedInUser.save();
    res.json({
      data: loggedInUser,
    });
  } catch (error) {
    res.status(404).send(`Error: ${error.message}`);
  }
});

profileRouter.patch("/profile/password", userAuthorized, async (req, res) => {
  try {
    const user = req.user;
    await validateEditPassword(user, req.body);
    const passwordHash = await bcrypt.hash(req.body.newConfirmPassword, 10);
    user.password = passwordHash;
    await user.save();
    res.clearCookie("token").send("Password updated successfully");
  } catch (error) {
    res.status(404).send(`Error: ${error.message}`);
  }
});

module.exports = profileRouter;
