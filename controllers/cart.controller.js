import Figure from "../models/Figure.js";
import Order from "../models/Order.js";
import Payment from "../models/Payment.js";

export const addToCart = async (req, res) => {
  const { figureId, quantity } = req.body;
  const userId = req.userId;

  try {
    const figure = await Figure.findById(figureId);

    if (!figure) {
      return res.status(404).json({ message: "Figure not found" });
    }

    if (figure.stock < quantity) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    const order = await Order.findOne({ 
      userId: userId, 
      status: "pending" 
    });

    if (!order) {
      const newOrder = new Order({
        userId,
        items: [{
          product: figureId,
          quantity,
          price: figure.price
        }],
        totalPrice: figure.price * quantity,
        status: "pending",
        paymentMethod: "credit card"
      });
      await newOrder.save();
      return res.status(201).json({ message: "Product added to cart", order: newOrder });
    }

    const existingItem = order.items.find(item => 
      item.product.toString() === figureId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.price = figure.price;
    } else {
      order.items.push({
        product: figureId,
        quantity,
        price: figure.price
      });
    }

    order.totalPrice = order.items.reduce((total, item) => 
      total + (item.price * item.quantity), 0
    );

    await order.save();

    res.status(200).json({ 
      message: "Product added to cart",
      order 
    });

  } catch (err) {
    console.log("Error in addToCart:", err);
    res.status(500).json({ message: "Error adding to cart" });
  }
};
export const checkout = async (req, res) => {
    const { paymentMethod, shippingAddress } = req.body;
    const userId = req.userId;
  
    try {
      // Find pending order for user
      const order = await Order.findOne({ 
        userId,
        status: "pending"
      });
  
      if (!order) {
        return res.status(404).json({ message: "No pending order found" });
      }
  
      // Create payment record
      const payment = new Payment({
        orderId: order._id,
        amount: order.totalPrice,
        paymentMethod,
        status: "completed",
        currency: "BGN"
      });
  
      // Update order status
      order.status = "paid";
      order.paymentMethod = paymentMethod;
      order.shippingAddress = shippingAddress;
  
      await Promise.all([
        payment.save(),
        order.save()
      ]);
  
      // Add console.log for debugging
 
  
      res.status(200).json({
        message: "Order completed successfully",
        order,
        payment
      });
  
    } catch (err) {
      console.error("Error in checkout:", err);
      res.status(500).json({ message: "Error completing order" });
    }
  };


export const getCart = async (req, res) => {
    
    try {
      const cart = await Order.findOne({ 
        userId: req.userId, 
        status: "pending" 
      }).populate("items.product");
      
  
      if (!cart) {
        return res.status(200).json({ 
          message: "Cart is empty",
          items: [] 
        });
      }
  
      res.status(200).json({ 
        message: "Cart retrieved successfully",
        cart 
      });
  
    } catch (err) {
      console.log("Error getting cart:", err);
      res.status(500).json({ message: "Error retrieving cart" });
    }
  };
  export const removeFromCart = async (req, res) => {
    const itemId = req.params.itemId;
    const userId = req.userId;
  
    try {
      const order = await Order.findOne({
        userId: userId,
        status: "pending"
      });
  
      if (!order) {
        return res.status(404).json({ message: "Cart not found" });
      }
  
      const itemIndex = order.items.findIndex(item => 
        item._id.toString() === itemId
      );
  
      if (itemIndex === -1) {
        return res.status(404).json({ message: "Item not found in cart" });
      }
  
      order.items.splice(itemIndex, 1);
  
      order.totalPrice = order.items.reduce((total, item) => 
        total + (item.price * item.quantity), 0
      );
  
      await order.save();
  
      res.status(200).json({
        message: "Item removed from cart successfully",
        order
      });
  
    } catch (err) {
      console.log("Error in removeFromCart:", err);
      res.status(500).json({ message: "Error removing item from cart" });
    }
  };