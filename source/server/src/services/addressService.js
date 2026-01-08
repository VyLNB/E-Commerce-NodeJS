import { StatusCodes } from "http-status-codes";
import { myLogger } from "~/loggers/mylogger.log";
import { userModel } from "~/models/userModel.js";
import ApiError from "~/utils/ApiError";
import { getVietnamDatetimeString } from "~/utils/datetime";

const getAddresses = async (userId) => {
  try {
    const addresses = await userModel.getAddressesByUserId(userId);
    if (!addresses) {
      throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
    }
    return addresses.map((address) => {
      const addressObj = address.toObject();
      addressObj.createdAt = getVietnamDatetimeString(addressObj.createdAt);
      addressObj.updatedAt = getVietnamDatetimeString(addressObj.updatedAt);
      return addressObj;
    });
  } catch (error) {
    myLogger.error(error.message, { stack: error.stack });
    throw error;
  }
};

const addAddress = async (userId, address) => {
  try {
    if (address.isDefault) {
      await userModel.unsetDefaultAddressesForUser(userId);
    }

    const newAddresses = await userModel.addAddress(userId, address);
    if (!newAddresses) {
      throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
    }

    return getAddresses(userId);
  } catch (error) {
    myLogger.error(error.message, { stack: error.stack });
    if (error.name === "ValidationError") {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Data was corrupted during server processing."
      );
    }
    throw error;
  }
};

const updateAddress = async (userId, addressId, updateData) => {
  try {
    if (updateData.isDefault) {
      await userModel.unsetDefaultAddressesForUser(userId);
    }

    const updatedAddress = await userModel.updateAddress(
      userId,
      addressId,
      updateData
    );
    if (!updatedAddress) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Address not found");
    }

    return getAddresses(userId);
  } catch (error) {
    myLogger.error(error.message, { stack: error.stack });
    if (error.name === "ValidationError") {
      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Data was corrupted during server processing."
      );
    }
    throw error;
  }
};

const deleteAddress = async (userId, addressId) => {
  try {
    const user = await userModel.getUserById(userId);
    const addressToDelete = user?.addresses.id(addressId);

    if (!addressToDelete) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Address not found");
    }

    if (addressToDelete.isDefault) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Cannot delete the default address. Please set another address as default first."
      );
    }

    await userModel.deleteAddress(userId, addressId);

    return getAddresses(userId);
  } catch (error) {
    myLogger.error(error.message, { stack: error.stack });
    throw error;
  }
};

export const addressService = {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
};
