const express = require("express");
const paymentRouter = express.Router();
const { userAuthorized } = require("../middlewares/auth");
const instance = require("../utils/razorpay");
const Payment = require("../models/payments");
const User = require("../models/user");
const { membershipType } = require("../utils/constants");
const {
  validateWebhookSignature,
} = require("razorpay/dist/utils/razorpay-utils");

paymentRouter.post("/payment/create", userAuthorized, async (req, res) => {
  try {
    const { _id, firstName, lastName, email } = req.user;
    const { type } = req.body;
    const options = {
      amount: membershipType[type] * 100,
      currency: "INR",
      receipt: "order_rcptid_11",
      notes: { firstName, lastName, email, membershipType: type },
    };
    const orderInstance = await instance.orders.create(options);
    const { amount, currency, id, notes, receipt, status } = orderInstance;

    const payment = new Payment({
      userId: _id,
      amount: amount / 100,
      orderId: id,
      receipt,
      currency,
      status,
      notes: {
        ...notes,
      },
    });
    await payment.save();
    res.json({ ...payment.toJSON(), key: process.env.RAZORPAY_KEY_ID });
  } catch (error) {
    res.status(400).json(error);
  }
});

paymentRouter.post("/payment/webhook", async (req, res) => {
  try {
    const webhookSignature = req.get["X-Razorpay-Signature"];
    const isWebhookValid = validateWebhookSignature(
      JSON.stringify(req.body),
      webhookSignature,
      process.env.WEBHOOK_SECRET
    );

    if (!isWebhookValid) {
      return res.send(400).json({ message: "webhook not found" });
    }

    const paymentDetails = req.body.payload.payment.entity;
    const { order_id, status } = paymentDetails;

    const payment = await Payment.findOne({ orderId: order_id });
    payment.status = status;
    await payment.save();

    if (req.body.event === "payment.captured") {
      const user = await User.findOne({ _id: payment.userId });
      user.isPremium = true;
      user.membershipType = paymentDetails.notes.membershipType;
      await user.save();
    }

    return res.send(200).json({ message: "Webhook recieved successfull" });
  } catch (error) {
    return res.send(500).json(error.message);
  }
});

module.exports = paymentRouter;
