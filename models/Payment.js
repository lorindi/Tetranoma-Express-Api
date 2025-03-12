import mongoose from "mongoose";

const paymentSchema = mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    amount: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["credit card", "paypal", "bank transfer", "stripe"],
    },
    currency: { type: String, default: "BGN" },
    transactionId: { type: String },
    // New fields for Stripe
    stripePaymentIntentId: { type: String },
    stripeCustomerId: { type: String },
    stripeChargeId: { type: String },
  },
  { timestamps: true }
);
const Payment = mongoose.model("Payment", paymentSchema);
export default Payment;
