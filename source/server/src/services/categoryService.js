import { StatusCodes } from "http-status-codes";
import { categoryModel } from "~/models/categoryModel";
import ApiError from "~/utils/ApiError";
import slugify from "slugify";

const create = async (data) => {
  data.slug = slugify(data.name, { lower: true, strict: true });
  try {
    return await categoryModel.create(data);
  } catch (error) {
    if (error.code === 11000) {
      throw new ApiError(
        StatusCodes.CONFLICT,
        `Category '${data.name}' already exists.`
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

  const result = await categoryModel.find(filter, options);
  return result;
};

const findById = async (id) => {
  const category = await categoryModel.findById(id);
  if (!category) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Category not found");
  }
  return category;
};

const update = async (id, data) => {
  if (data.name) {
    data.slug = slugify(data.name, { lower: true, strict: true });
  }
  const updatedCategory = await categoryModel.update(id, data);
  if (!updatedCategory) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Category not found");
  }
  return updatedCategory;
};

const remove = async (id) => {
  const deletedCategory = await categoryModel.remove(id);
  if (!deletedCategory) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Category not found");
  }
  return { _id: deletedCategory._id, message: "Category deleted successfully" };
};

export const categoryService = { create, find, findById, update, remove };
