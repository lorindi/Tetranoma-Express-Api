import User from "../models/User.js";
import Figure from "../models/Figure.js";
import Order from "../models/Order.js";
import {
  createFigure,
  updateFigure,
  deleteFigure,
  listFigures
} from "./figure.controller.js";
import { createAccount } from "./auth.controller.js";
import { updateProfile, deleteProfile } from "./profile.controller.js";

export const createUser = async (req, res) => {
  try {
    req.isAdminRequest = true;
    await createAccount(req, res);
  } catch (err) {
    console.log("Error in admin createUser:", err);
    res.status(500).json({ message: "Failed to create user from admin panel" });
  }
};

export const updateUser = async (req, res) => {
  try {
    const originalUserId = req.userId;
    req.userId = req.params.userId;
    req.isAdminRequest = true;
    await updateProfile(req, res);
    req.userId = originalUserId;
  } catch (err) {
    console.log("Error in admin updateUser:", err);
    res.status(500).json({ message: "Failed to update user from admin panel" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const originalUserId = req.userId;
    req.userId = req.params.userId;
    req.isAdminRequest = true;
    const userToDelete = await User.findById(req.params.userId);
    if (userToDelete.role === "admin") {
      return res.status(403).json({ message: "Cannot delete admin user" });
    }
    await deleteProfile(req, res);
    req.userId = originalUserId;
  } catch (err) {
    console.log("Error in admin deleteUser:", err);
    res.status(500).json({ message: "Failed to delete user from admin panel" });
  }
};

export const updateUserRole = async (req, res) => {
  const { userId, role } = req.body;

  try {
    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User role updated successfully",
      user,
    });
  } catch (err) {
    console.log("Error in updateUserRole:", err);
    res.status(500).json({ message: "Failed to update user role" });
  }
};
export const createFigureAdmin = async (req, res) => {
  try {
    const originalUserId = req.userId;
    req.isAdminRequest = true;

    if (!req.body.targetUserId) {
      console.log("No target user specified");
      return res.status(400).json({ message: "You must specify a user to create the figure for" });
    }

    await createFigure(req, res);

    req.userId = originalUserId;
  } catch (err) {
    console.log("Error in admin createFigure:", err);
    res.status(500).json({ message: "Failed to create figure" });
  }
};

export const updateFigureAdmin = async (req, res) => {
  try {
    const originalUserId = req.userId;
    req.isAdminRequest = true;

    if (!req.body.targetUserId) {
      return res.status(400).json({ message: "Target user ID is required for figure update" });
    }

    await updateFigure(req, res);

    req.userId = originalUserId;
  } catch (err) {
    console.log("Error in admin updateFigure:", err);
    res.status(500).json({ message: "Failed to update figure" });
  }
};
export const deleteFigureAdmin = async (req, res) => {
  try {
    const originalUserId = req.userId;
    req.isAdminRequest = true;

    if (!req.body.targetUserId) {
      return res.status(400).json({ message: "Target user ID is required for figure deletion" });
    }

    // Verify target user exists
    const targetUser = await User.findById(req.body.targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: "Target user not found" });
    }

    await deleteFigure(req, res);

    req.userId = originalUserId;
  } catch (err) {
    console.log("Error in admin deleteFigure:", err);
    res.status(500).json({ message: "Failed to delete figure" });
  }
};

export const getAllUsersWithActivity = async (req, res) => {
  try {
    console.log("Getting all users with activity data");
    
    // Създаване на филтър обект
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: "i" } },
        { email: { $regex: req.query.search, $options: "i" } }
      ];
    }

    // Намиране на потребители с филтър
    const users = await User.find(filter).select("-password");

    // Събиране на активността за всеки потребител
    const usersWithActivity = await Promise.all(
      users.map(async (user) => {
        console.log("Processing user activity for:", user.email);
        
        const figuresCount = await Figure.countDocuments({ userId: user._id });
        const ordersCount = await Order.countDocuments({ userId: user._id });
        const totalSpent = await Order.aggregate([
          { $match: { userId: user._id, status: "paid" } },
          { $group: { _id: null, total: { $sum: "$totalPrice" } } }
        ]);

        return {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          createdAt: user.createAt,
          activity: {
            figuresCount,
            ordersCount,
            totalSpent: totalSpent[0]?.total || 0
          }
        };
      })
    );

    console.log("Users with activity retrieved successfully");
    
    res.status(200).json({
      message: "Users retrieved successfully",
      users: usersWithActivity
    });
    
  } catch (err) {
    console.log("Error getting users with activity:", err);
    res.status(500).json({ message: "Failed to retrieve users" });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    console.log("Getting all orders for admin");
    
    const { status, startDate, endDate, userId } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (userId) filter.userId = userId;
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const orders = await Order.find(filter)
      .populate("userId", "name email")
      .populate("items.product")
      .sort({ createdAt: -1 });

    const stats = {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + order.totalPrice, 0),
      ordersByStatus: {
        pending: orders.filter(o => o.status === "pending").length,
        paid: orders.filter(o => o.status === "paid").length,
        shipped: orders.filter(o => o.status === "shipped").length,
        delivered: orders.filter(o => o.status === "delivered").length
      }
    };

    console.log("Orders retrieved successfully", { totalOrders: orders.length });

    res.status(200).json({
      message: "Orders retrieved successfully",
      orders,
      stats
    });

  } catch (err) {
    console.log("Error in getAllOrders:", err);
    res.status(500).json({ message: "Failed to retrieve orders" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    console.log("Updating order status");
    
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    ).populate("userId", "name email");

    console.log("Order status updated", { orderId, newStatus: status });

    res.status(200).json({
      message: "Order status updated successfully",
      order
    });

  } catch (err) {
    console.log("Error in updateOrderStatus:", err);
    res.status(500).json({ message: "Failed to update order status" });
  }
};

export const getAdminDashboardStats = async (req, res) => {
  try {
    console.log("Getting admin dashboard statistics");

    const stats = {
      totalUsers: await User.countDocuments(),
      totalFigures: await Figure.countDocuments(),
      totalOrders: await Order.countDocuments(),
      revenue: await Order.aggregate([
        { $match: { status: "paid" } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } }
      ]),
      recentOrders: await Order.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("userId", "name email")
    };

    console.log("Admin stats retrieved successfully");

    res.status(200).json({
      message: "Admin statistics retrieved successfully",
      stats
    });
  } catch (err) {
    console.log("Error getting admin stats:", err);
    res.status(500).json({ message: "Failed to retrieve admin statistics" });
  }
};