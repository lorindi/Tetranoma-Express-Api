import User from "../models/User.js";
import Figure from "../models/Figure.js";
import Order from "../models/Order.js";

export const getProfile = async (req, res) => {
  try {
    
    const user = await User.findById(req.userId)
      .select("-password")
      .lean();
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get additional user statistics
    const figuresCount = await Figure.countDocuments({ userId: req.userId });
    const ordersCount = await Order.countDocuments({ userId: req.userId });

    const userWithStats = {
      ...user,
      stats: {
        figuresCount,
        ordersCount
      }
    };

    res.status(200).json({
      message: "Profile retrieved successfully",
      user: userWithStats
    });
    
  } catch (err) {
    console.log("Error in getProfile:", err);
    res.status(500).json({ message: "Failed to retrieve profile" });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email, avatar } = req.body;
    
    if (!name && !email && !avatar) {
      console.log("No data to update");
      return res.status(400).json({ message: "No data provided for update" });
    }

    // Check if email already exists
    if (email) {
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: req.userId } 
      });
      
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      {
        $set: {
          ...(name && { name }),
          ...(email && { email }),
          ...(avatar && { avatar })
        }
      },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser
    });

  } catch (err) {
    console.log("Error in updateProfile:", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

export const deleteProfile = async (req, res) => {
  try {

    // Delete user
    const deletedUser = await User.findByIdAndDelete(req.userId);
    
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete all user's figures
    await Figure.deleteMany({ userId: req.userId });
    
    // Delete all user's orders
    await Order.deleteMany({ userId: req.userId });
    
    // Clear authentication token
    res.clearCookie("token");

    res.status(200).json({ message: "Profile deleted successfully" });

  } catch (err) {
    console.log("Error in deleteProfile:", err);
    res.status(500).json({ message: "Failed to delete profile" });
  }
};