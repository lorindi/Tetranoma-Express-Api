import Stripe from "stripe";
import dotenv from "dotenv";
import Payment from "../models/Payment.js";
import Order from "../models/Order.js"; // Предполагам, че имате модел за поръчки

dotenv.config();

// Инициализирайте Stripe с вашия секретен ключ
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Създаване на Stripe Payment Intent
export const createPaymentIntent = async (req, res) => {
  try {
    console.log("Creating Stripe payment intent");
    const { orderId, amount } = req.body;
    
    if (!orderId || !amount) {
      console.log("Missing required fields");
      return res.status(400).json({ message: "Order ID and amount are required" });
    }

    // Създаване на Payment Intent в Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe изисква сумата в стотинки
      currency: "bgn",
      metadata: { orderId },
    });

    console.log("Payment intent created:", paymentIntent.id);

    // Създаване на запис за плащане в базата данни
    const payment = new Payment({
      orderId,
      amount,
      paymentMethod: "stripe",
      status: "pending",
      stripePaymentIntentId: paymentIntent.id,
      currency: "BGN",
    });

    await payment.save();
    console.log("Payment record saved to database");

    // Връщане на client secret към клиента
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      paymentId: payment._id,
    });
  } catch (error) {
    console.log("Error creating payment intent:", error);
    res.status(500).json({ message: "Error creating payment", error: error.message });
  }
};

// Потвърждаване на успешно плащане
export const confirmPayment = async (req, res) => {
  try {
    console.log("Confirming payment");
    const { paymentIntentId } = req.body;
    
    // Проверка на статуса на Payment Intent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status === "succeeded") {
      // Актуализиране на записа за плащане
      const payment = await Payment.findOneAndUpdate(
        { stripePaymentIntentId: paymentIntentId },
        { 
          status: "completed",
          transactionId: paymentIntent.id
        },
        { new: true }
      );
      
      if (!payment) {
        console.log("Payment not found");
        return res.status(404).json({ message: "Payment not found" });
      }
      
      // Актуализиране на статуса на поръчката
      await Order.findByIdAndUpdate(
        payment.orderId,
        { paymentStatus: "paid" }
      );
      
      console.log("Payment confirmed successfully");
      res.status(200).json({ message: "Payment confirmed", payment });
    } else {
      console.log("Payment not succeeded:", paymentIntent.status);
      res.status(400).json({ message: "Payment not succeeded", status: paymentIntent.status });
    }
  } catch (error) {
    console.log("Error confirming payment:", error);
    res.status(500).json({ message: "Error confirming payment", error: error.message });
  }
};

// Webhook за обработка на събития от Stripe
export const handleWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    console.log("Processing Stripe webhook");
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.log("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Обработка на различни събития
  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object;
      console.log("PaymentIntent succeeded:", paymentIntent.id);
      
      // Актуализиране на плащането в базата данни
      await Payment.findOneAndUpdate(
        { stripePaymentIntentId: paymentIntent.id },
        { 
          status: "completed",
          transactionId: paymentIntent.id
        }
      );
      break;
      
    case "payment_intent.payment_failed":
      const failedPaymentIntent = event.data.object;
      console.log("Payment failed:", failedPaymentIntent.id);
      
      await Payment.findOneAndUpdate(
        { stripePaymentIntentId: failedPaymentIntent.id },
        { status: "failed" }
      );
      break;
      
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.status(200).json({ received: true });
};