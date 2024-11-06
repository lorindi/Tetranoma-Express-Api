import User from "../models/User.js";
import bcrypt from "bcrypt";

export const createAccount = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });

    if (existingUser)
      return res.status(401).json({ message: "User already existing" });

    const newUser = new User({
      name,
      email,
      password,
    });
    const saveUser = await newUser.save();

    res.status(200).json({ message: "User created successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to create an account" });
  }
};
export const signIn = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (!user) return res.status(401).json({ message: "User not found" });

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword)
      return res.status(401).json({ message: "Invalid credential" });

    const { password: _, ...userInfo } = user._doc;

    res
      .status(200)
      .json({ message: "User sign in successfully", user: userInfo });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to sign in account" });
  }
};
export const logout = async (req, res) => {};
