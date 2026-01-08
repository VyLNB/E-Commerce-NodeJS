import mongoose from "mongoose";
import { brandSchema } from "./schemas.js";

const Brand = mongoose.model("Brand", brandSchema);

const create = async (data) => await new Brand(data).save();

const find = async (filter = {}, options = {}) => {
  const page = parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
  const limit =
    parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 20;
  const sort = options.sort || { name: 1 };
  const skip = (page - 1) * limit;

  const [docs, total] = await Promise.all([
    Brand.find(filter).sort(sort).skip(skip).limit(limit).exec(),
    Brand.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    brands: docs,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      limit,
    },
  };
};

const findById = async (id) => await Brand.findById(id).exec();

const update = async (id, data) =>
  await Brand.findByIdAndUpdate(id, data, { new: true }).exec();

const remove = async (id) => await Brand.findByIdAndDelete(id).exec();

export const brandModel = { create, find, findById, update, remove };
