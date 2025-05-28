const mongoose = require("mongoose");

const connectDB = async () => {
  mongoose.connect(
    "mongodb+srv://priyanshumodiwork1:TqKhk9vIcZKoykAP@project1.w7muikt.mongodb.net/devTinder"
  );
};

module.exports = connectDB;
