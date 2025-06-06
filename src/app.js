const express = require("express");
const app = express();
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");

require("./utils/cron");
require("dotenv").config();

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const paymentRouter = require("./routes/payment");

const allowedOrigins = ["http://localhost:5173", "https://www.therichie.in"];

app.use(
  cors({
    origin: [allowedOrigins],
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());

app.use("/", authRouter);
app.use("/", profileRouter);
app.use("/", requestRouter);
app.use("/", userRouter);
app.use("/", paymentRouter);

connectDB().then(() => {
  console.log("Data base connected");
  app.listen(3000, () => {
    console.log("Listening to port 3000");
  });
});
