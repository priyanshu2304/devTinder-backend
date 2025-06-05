const mongoose = require("mongoose");

const connectDB = async () => {
  mongoose.connect(process.env.DATA_BASE);
};

module.exports = connectDB;
