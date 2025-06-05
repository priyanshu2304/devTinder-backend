const mongoose = require("mongoose");

const connectDB = async () => {
  console.log("pr", process.env.DATA_BASE);
  mongoose.connect(process.env.DATA_BASE);
};

module.exports = connectDB;
