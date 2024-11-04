import mongoose from "mongoose";
import bcrypt from "bcrypt";
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    require: true,
    unique: true,
  },
  name: {
    type: String,
    require: true,
  },
  password: {
    type: String,
    require: true,
  },
  avatar: {
    type: String,
    default: null,
  },
  createAt: {
    type: Date,
    default: Date.now,
  },
});
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const hash = await bcrypt(this.password, 10);
    this.password = hash;
  }
  next();
});
const User = mongoose.model("User", userSchema);
export default User;
