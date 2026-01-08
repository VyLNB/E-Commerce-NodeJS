import { StatusCodes } from "http-status-codes";
import ApiError from "~/utils/ApiError.js";
import { addressService } from "~/services/addressService.js";

const addAddress = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const addressData = req.body;
    const updatedAddresses = await addressService.addAddress(
      userId,
      addressData
    );
    if (!updatedAddresses) {
      throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
    }

    res.locals.message = "Address added successfully!";
    res.locals.data = updatedAddresses;
    return res.status(StatusCodes.OK).json(updatedAddresses);
  } catch (error) {
    return next(error);
  }
};

const getAddresses = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const addresses = await addressService.getAddresses(userId);
    res.locals.message = "Get all addresses success!";
    res.locals.data = addresses;
    return res.status(StatusCodes.OK).json(addresses);
  } catch (error) {
    return next(error);
  }
};

const updateAddress = async (req, res, next) => {
  try {
    const { userId, addressId } = req.params;
    const addressData = req.body;

    const updatedAddress = await addressService.updateAddress(
      userId,
      addressId,
      addressData
    );

    res.locals.message = "Address updated successfully!";
    res.locals.data = updatedAddress;
    return res.status(StatusCodes.OK).json(updatedAddress);
  } catch (error) {
    return next(error);
  }
};

const deleteAddress = async (req, res, next) => {
  try {
    const { userId, addressId } = req.params;

    const remainingAddresses = await addressService.deleteAddress(
      userId,
      addressId
    );

    res.locals.message = "Address deleted successfully!";
    res.locals.data = remainingAddresses;
    return res.status(StatusCodes.OK).json(remainingAddresses);
  } catch (error) {
    return next(error);
  }
};

export const addressController = {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
};
