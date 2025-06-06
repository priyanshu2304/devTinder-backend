const mongoose = require("mongoose");

const { Schema } = mongoose;

const paymentSchema = new Schema(
  {
    orderId: {
      type: String,
      require: true,
    },
    receipt: {
      type: String,
      require: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    currency: {
      type: String,
      require: true,
    },
    amount: {
      type: Number,
      require: true,
    },
    status: {
      type: String,
      require: true,
    },
    notes: {
      firstName: {
        type: String,
      },
      lastName: {
        type: String,
      },
      email: {
        type: String,
      },
      membershipType: {
        type: String,
        require: true,
      },
    },
  },
  { timestamps: true }
);

const paymentModel = mongoose.model("paymentModel", paymentSchema);

module.exports = paymentModel;
