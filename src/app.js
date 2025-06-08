const express = require("express");
const app = express();
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const { createServer } = require("http");
const initialiseSocket = require("./utils/sockets");

require("./utils/cron");
require("dotenv").config();

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const paymentRouter = require("./routes/payment");
const chatRouter = require("./routes/Chat");

const allowedOrigins = ["http://localhost:5173", "https://www.therichie.in"];

const server = createServer(app);
initialiseSocket(server, allowedOrigins);

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
app.use("/", chatRouter);

connectDB().then(() => {
  console.log("Data base connected");
  server.listen(3000, () => {
    console.log("Listening to port 3000");
  });
});
