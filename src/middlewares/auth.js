const jwt = require("jsonwebtoken");
const User = require("../models/user");

const userAuthorized = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) {
      return res.status(401).send("Please login to continue");
    }

    const { _id } = await jwt.verify(token, "Priyanshu@123");
    const user = await User.findById(_id);
    if (!user) {
      throw new Error("user not found ");
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(404).send(`Error: ${error.message}`);
  }
};

module.exports = {
  userAuthorized,
};
