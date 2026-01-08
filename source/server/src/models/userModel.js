import mongoose from "mongoose";
import { newUserSchema, userSchema } from "./schemas.js";

const User = mongoose.model("User", userSchema);
const NewUser = mongoose.model("NewUser", newUserSchema);

const createUser = async (userData) => {
  const user = new NewUser(userData);
  return await user.save();
};

const getUserByEmail = async (email) => await User.findOne({ email }).exec();

const getUserById = async (id) => await User.findById(id).exec();

// ADDRESSES
const addAddress = async (userId, address) => {
  const user = await User.findById(userId);
  if (!user) return null;
  user.addresses.push(address);
  const updatedUser = await user.save();
  return updatedUser.addresses;
};

const getAddressesByUserId = async (userId) => {
  const user = await User.findById(userId).select("addresses").exec();
  return user ? user.addresses : null;
};

const updateAddress = async (userId, addressId, updateData) => {
  const updateFields = {};
  for (const key in updateData) {
    updateFields[`addresses.$[elem].${key}`] = updateData[key];
  }

  const user = await User.findOneAndUpdate(
    { _id: userId },
    { $set: updateFields },
    {
      arrayFilters: [{ "elem._id": addressId }],
      new: true,
      select: "addresses",
    }
  ).exec();

  if (!user) return null;

  const updatedAddress = user.addresses.find(
    (addr) => addr._id.toString() === addressId
  );
  return updatedAddress;
};

// Bỏ isDefault: true cho tất cả địa chỉ của một user
const unsetDefaultAddressesForUser = async (userId) =>
  await User.updateMany(
    { _id: userId },
    { $set: { "addresses.$[].isDefault": false } }
  );

const deleteAddress = async (userId, addressId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $pull: { addresses: { _id: addressId } } },
    { new: true, select: "addresses" } // Trả về mảng addresses sau khi xóa
  ).exec();
  return user ? user.addresses : null;
};

// Cập nhật thôgn tin user
const updateUser = async (userId, updateData) => {
  const user = await User.findByIdAndUpdate(userId, updateData, { new: true });
  return user;
};

// Cập nhật thông tin user theo email
const updateUserByEmail = async (email, updateData) => {
  const user = await User.findOneAndUpdate({ email }, updateData, {
    new: true,
  });
  return user;
};

// Lấy tất cả users
/* eslint-disable indent */
const getAllUsers = async (page = 1, limit = 20, search = "") => {
  const skip = (page - 1) * limit;
  const query = search
    ? {
        $or: [
          { fullName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }
    : {};
  const users = await User.find(query).skip(skip).limit(limit).exec();
  const total = await User.countDocuments(query);
  return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
};
/* eslint-enable indent */

// Lấy status user theo email
const getUserStatusByEmail = async (email) => {
  const user = await User.findOne({ email }, { status: 1 }).exec();
  return user ? user.status : null;
};

// Kiểm tra user có tồn tại không
const isUserExists = async (email) => {
  const exists = await User.exists({ email });
  return exists ? true : false;
};

// Kiểm tra user có tồn tại không (theo id)
const isUserExistsById = async (userId) => {
  const exists = await User.exists({ _id: userId });
  return exists ? true : false;
};

// Lấy role user theo id
const getUserRoleById = async (userId) => {
  const user = await User.findById(userId, { role: 1 }).exec();
  return user ? user.role : null;
};

// Xóa user
const deleteUser = async (userId) => {
  const result = await User.findByIdAndDelete(userId).exec();
  return result;
};

export const userModel = {
  getUserByEmail,
  getUserById,
  createUser,
  addAddress,
  getAllUsers,
  updateUser,
  updateUserByEmail,
  getUserStatusByEmail,
  isUserExists,
  getUserRoleById,
  deleteUser,
  isUserExistsById,
  updateAddress,
  getAddressesByUserId,
  unsetDefaultAddressesForUser,
  deleteAddress,
};
