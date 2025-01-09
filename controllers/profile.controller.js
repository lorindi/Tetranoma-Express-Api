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
    const { name, email, avatar, role } = req.body;
    const userIdToUpdate = req.isAdminRequest ? req.params.userId : req.userId;
    
    if (!name && !email && !avatar && !role) {
      return res.status(400).json({ message: "No data provided for update" });
    }

    if (email) {
      const existingUser = await User.findOne({ 
        email, 
        _id: { $ne: userIdToUpdate } 
      });
      
      if (existingUser) {
        return res.status(400).json({ message: "Email already in use" });
      }
    }

    const updateData = {
      ...(name && { name }),
      ...(email && { email }),
      ...(avatar && { avatar }),
      ...(req.isAdminRequest && role && { role })
    };

    if (role === "admin" && !req.isAdminRequest) {
      return res.status(403).json({ message: "Unauthorized role change" });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userIdToUpdate,
      { $set: updateData },
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
    
    const userIdToDelete = req.isAdminRequest ? req.params.userId : req.userId;
    
    const deletedUser = await User.findByIdAndDelete(userIdToDelete);
    
    if (!deletedUser) {
      console.log("User not found for deletion");
      return res.status(404).json({ message: "User not found" });
    }

    await Figure.deleteMany({ userId: userIdToDelete });
    
    await Order.deleteMany({ userId: userIdToDelete });
    
    if (!req.isAdminRequest) {
      res.clearCookie("token");
    }

    res.status(200).json({ 
      message: "Profile deleted successfully",
      deletedUser: {
        id: deletedUser._id,
        email: deletedUser.email,
        name: deletedUser.name
      }
    });

  } catch (err) {
    console.log("Error in deleteProfile:", err);
    res.status(500).json({ message: "Failed to delete profile" });
  }
};