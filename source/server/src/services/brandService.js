import { StatusCodes } from "http-status-codes";
import { brandModel } from "~/models/brandModel";
import ApiError from "~/utils/ApiError";
import slugify from "slugify";

const create = async (data) => {
  data.slug = slugify(data.name, { lower: true, strict: true });
  try {
    return await brandModel.create(data);
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        `Brand '${data.name}' already exists.`
      );
    }
    throw error;
  }
};

const find = async (queryParams, onlyActive = true) => {
  const { q, page, limit } = queryParams;

  const filter = {};
  if (onlyActive) filter.isActive = true;
  if (q) filter.name = { $regex: q, $options: "i" };

  const options = { page, limit };

  const result = await brandModel.find(filter, options);
  return result;
};

const findById = async (id) => {
  const brand = await brandModel.findById(id);
  if (!brand) throw new ApiError(StatusCodes.NOT_FOUND, "Brand not found");
  return brand;
};

const update = async (id, data) => {
  if (data.name) {
    data.slug = slugify(data.name, { lower: true, strict: true });
  }
  const updatedBrand = await brandModel.update(id, data);
  if (!updatedBrand) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Brand not found");
  }
  return updatedBrand;
};

const remove = async (id) => {
  const deletedBrand = await brandModel.remove(id);
  if (!deletedBrand) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Brand not found");
  }
  return { _id: deletedBrand._id, message: "Brand deleted successfully" };
};

export const brandService = { create, find, findById, update, remove };
