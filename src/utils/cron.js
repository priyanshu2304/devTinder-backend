const crons = require("node-cron");
const { subDays, startOfDay, endOfDay } = require("date-fns");
const connectionRequestModel = require("../models/connectionRequest");
const { run } = require("../utils/sendEmail");

crons.schedule("0 0 * 1 0", async () => {
  try {
    const yesterdayDate = subDays(new Date(), 1);

    const startTime = startOfDay(yesterdayDate);
    const endTime = endOfDay(yesterdayDate);

    const pendingConnectionRequest = await connectionRequestModel
      .find({
        status: "interested",
        createdAt: {
          $gte: startTime,
          $lte: endTime,
        },
      })
      .populate("fromUserId toUserId");

    const uniqueUserMap = new Map();

    pendingConnectionRequest.forEach((req) => {
      const user = req.toUserId;
      if (user?.email && !uniqueUserMap.has(user.email)) {
        uniqueUserMap.set(user.email, user);
      }
    });

    const uniqueUsers = [...uniqueUserMap.values()];

    for (const user of uniqueUsers) {
      const firstName = user.firstName || "there";
      const email = user.email;

      const resp = await run({
        subject: "Welcome to DevTinder!",
        html: `<h1>Hello ${firstName}!</h1><p>Thanks for signing up.</p>`,
        text: `Hello ${firstName}! Thanks for signing up.`,
      });
      console.log("resp", resp);
    }
  } catch (err) {
    console.log(err);
  }
});

module.exports = crons;
