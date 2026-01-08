import mongoose from "mongoose";

// Minimal user schema for worker: only keep fields needed for avatar updates
const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    avatar: { type: String, default: "" },
    fullName: { type: String, required: true },
    loyaltyPoints: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false }
);

const User = mongoose.model("User", userSchema);

// Cập nhật thôgn tin user
const updateUser = async (userId, updateData) => {
  let user = await User.findByIdAndUpdate(userId, updateData, { new: true });
  if (!user) throw new Error("User not found");
  user = user.toObject();
  delete user.password;
  delete user.addresses;
  return user;
};

export const userModel = {
  updateUser,
  User,
};
