const express = require("express");
const { userAuthorized } = require("../middlewares/auth");
const connectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const userRouter = express.Router();

userRouter.get("/user/requests/recieved", userAuthorized, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const { _id } = loggedInUser;

    const connectedUser = await connectionRequest
      .find({
        toUserId: _id,
        status: "interested",
      })
      .populate(
        "fromUserId",
        "firstName lastName age about gender skills about"
      );

    res.json(connectedUser);
  } catch (error) {
    res.status(404).send(`Error: ${error.message}`);
  }
});

userRouter.get(
  "/user/connections/:status",
  userAuthorized,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const { status } = req.params;
      const { _id } = loggedInUser;

      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status)) {
        throw new Error(`${status} not allowed`);
      }

      const userCondition =
        status === "accepted"
          ? { $or: [{ toUserId: _id }, { fromUserId: _id }] }
          : { toUserId: _id };
      let data = await connectionRequest
        .find({
          ...userCondition,
          status,
        })
        .populate(
          "fromUserId",
          "firstName lastName age about gender skills about photoUrl"
        )
        .populate(
          "toUserId",
          "firstName lastName age about gender skills about photoUrl"
        );
      data = data.map((row) => {
        if (String(row.fromUserId._id) === String(_id)) {
          return row.toUserId;
        } else {
          return row.fromUserId;
        }
      });

      res.json({
        message: `${status} list`,
        data,
      });
    } catch (error) {
      res.status(404).send(`Error: ${error.message}`);
    }
  }
);

userRouter.get("/feed", userAuthorized, async (req, res) => {
  //   try {
  //     const { _id } = req.user;
  //     const limit = parseInt(req.query.limit > 50 ? 50 : req.query.limit) || 10;
  //     let page = parseInt(req.query.page) || 1;
  //     let skip = (page - 1) * limit;

  //     const connections = await connectionRequest
  //       .find({
  //         $or: [{ toUserId: _id }, { fromUserId: _id }],
  //       })
  //       .select("toUserId fromUserId");

  //     const hideUser = new Set();
  //     connections.forEach((req) => {
  //       hideUser.add(req.fromUserId.toString());
  //       hideUser.add(req.toUserId.toString());
  //     });

  //     const userFeed = await User.find({
  //       $and: [{ _id: { $nin: Array.from(hideUser) } }, { _id: { $ne: _id } }],
  //     })
  //       .select("firstName lastName skills age about")
  //       .skip(skip)
  //       .limit(limit);
  //     const totalCount = await User.countDocuments({
  //       $and: [{ _id: { $nin: Array.from(hideUser) } }, { _id: { $ne: _id } }],
  //     });
  //     res.json({ userFeed, pageNumber: page, limit, totalCount });
  //   } catch (error) {
  //     res.status(404).send(`Error: ${error.message}`);
  //   }

  try {
    const { _id } = req.user;
    const limit = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 5;
    const skip = (page - 1) * limit;

    const connectedRequest = await connectionRequest
      .find({
        $or: [{ fromUserId: _id }, { toUserId: _id }],
      })
      .select("fromUserId toUserId");

    const hideUser = new Set();
    connectedRequest.forEach((req) => {
      hideUser.add(req.toUserId);
      hideUser.add(req.fromUserId);
    });
    hideUser.add(_id);

    const userFeed = await User.find({
      _id: { $nin: Array.from(hideUser) },
    })
      .select("firstName lastName skills age about photoUrl")
      .skip(0)
      .limit(limit);

    const totalCount = await User.countDocuments({
      _id: { $nin: Array.from(hideUser) },
    });

    res.send({ userFeed, page, limit, totalCount });
  } catch (error) {
    res.status(400).send(`Error: ${error.message}`);
  }
});

module.exports = userRouter;
