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
    const webhookSignature = req.headers["x-razorpay-signature"];

    const isWebhookValid = validateWebhookSignature(
      JSON.stringify(req.body),
      webhookSignature,
      process.env.WEBHOOK_SECRET
    );

    if (!isWebhookValid) {
      return res.status(400).json({ message: "Invalid webhook signature" });
    }

    const paymentDetails = req.body.payload.payment.entity;
    const { order_id, status } = paymentDetails;

    const payment = await Payment.findOne({ orderId: order_id });
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    payment.status = status;
    await payment.save();
    if (req.body.event === "payment.captured") {
      const user = await User.findById(payment.userId);
      if (user) {
        user.isPremium = true;
        user.membershipType = paymentDetails.notes.membershipType;
        await user.save();
      }
    }

    return res.status(200).json({ message: "Webhook received successfully" });
  } catch (error) {
    console.error("Webhook error:", error);
    return res.status(500).json({ message: error.message });
  }
});

paymentRouter.get("/paymentverify", userAuthorized, async (req, res) => {
  try {
    const user = req.user;
    if (user.isPremium) {
      return res.json({ message: "payment Verified", isPremium: true });
    }
    return res.json({ message: "payment Verified", isPremium: false });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = paymentRouter;
