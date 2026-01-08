import mongoose from "mongoose";
import { categorySchema } from "./schemas.js";

const Category = mongoose.model("Category", categorySchema);

const create = async (data) => await new Category(data).save();

const find = async (filter = {}, options = {}) => {
  const page = parseInt(options.page, 10) > 0 ? parseInt(options.page, 10) : 1;
  const limit =
    parseInt(options.limit, 10) > 0 ? parseInt(options.limit, 10) : 0;
  const sort = options.sort || { name: 1 };
  const skip = (page - 1) * limit;

  const [docs, total] = await Promise.all([
    Category.find(filter).sort(sort).skip(skip).limit(limit).exec(),
    Category.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    categories: docs,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: total,
      limit,
    },
  };
};

const findBySlug = async (slug) => await Category.findOne({ slug }).exec();

const findById = async (id) => await Category.findById(id).exec();

const findBySlugs = async (slugs) => {
  // 1. Tìm tất cả các Category khớp với danh sách slugs đầu vào
  const mainCategories = await Category.find(
    { slug: { $in: slugs } },
    { _id: 1 }
  ).exec();

  const mainCategoryIds = mainCategories.map((cat) => cat._id);

  // 2. Tìm tất cả các Category có parentCategoryId nằm trong danh sách mainCategoryIds
  const childCategories = await Category.find(
    { parentCategoryId: { $in: mainCategoryIds } },
    { _id: 1 }
  ).exec();

  // 3. Gộp tất cả các ID lại thành một danh sách duy nhất
  const allCategoryIds = [
    ...mainCategoryIds,
    ...childCategories.map((cat) => cat._id),
  ];

  // Trả về một mảng các ObjectId duy nhất
  return Array.from(new Set(allCategoryIds));
};

const update = async (id, data) =>
  await Category.findByIdAndUpdate(id, data, { new: true }).exec();

const remove = async (id) => await Category.findByIdAndDelete(id).exec();

export const categoryModel = {
  create,
  find,
  findById,
  findBySlug,
  findBySlugs,
  update,
  remove,
};
