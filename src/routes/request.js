const express = require("express");
const requestRouter = express.Router();
const { userAuthorized } = require("../middlewares/auth");
const User = require("../models/user");
const ConnecionRequest = require("../models/connectionRequest");

requestRouter.post(
  "/sendConnectionRequest",
  userAuthorized,
  async (req, res) => {
    try {
      const user = req.user;
      res.send(user);
    } catch (error) {
      res.status(404).send(`Error: ${error}`);
    }
  }
);

requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuthorized,
  async (req, res) => {
    try {
      let fromUserId = req.user._id;
      let toUserId = req.params.toUserId;
      let status = req.params.status;
      let from = req.user.firstName;

      const allowedStatus = ["interested", "ignored"];

      if (!allowedStatus.includes(status)) {
        throw new Error("Status is not valid");
      }
      const isUserExist = await User.findById(toUserId);
      if (!isUserExist) {
        throw new Error("User not found");
      }

      let toUserName = isUserExist.firstName;

      const isConnectionExisting = await ConnecionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });
      if (isConnectionExisting) {
        throw new Error("Connection Already Made");
      }

      const connectionRequest = new ConnecionRequest({
        fromUserId,
        toUserId,
        status,
        from,
        to: toUserName,
      });

      const data = await connectionRequest.save();

      res.json({ message: "Connection Made", data });
    } catch (error) {
      res.status(400).send(`Error: ${error}`);
    }
  }
);

requestRouter.post(
  "/request/review/:status/:requestId",
  userAuthorized,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const { status, requestId } = req.params;

      const allowedStatus = ["accepted", "rejected"];

      if (!allowedStatus.includes(status)) {
        throw new Error("Status not acceptable");
      }

      const connectionRequest = await ConnecionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });

      if (!connectionRequest) {
        throw new Error("Connection is not found");
      }

      connectionRequest.status = status;

      const data = await connectionRequest.save();

      res.json({
        message: "Connection Accepted",
        data,
      });
    } catch (error) {
      res.status(404).send(`Error: ${error}`);
    }
  }
);

module.exports = requestRouter;
