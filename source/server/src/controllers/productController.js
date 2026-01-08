import { StatusCodes } from "http-status-codes";
import { productService } from "~/services/productService.js";
import catchAsync from "~/utils/catchAsync";
import { ROLE } from "~/utils/constants";
import { myLogger } from "~/loggers/mylogger.log";

const find = catchAsync(async (req, res) => {
  const queryParams = {
    ...req.query,
    minPrice: req.query.minPrice ? Number(req.query.minPrice) : undefined,
    maxPrice: req.query.maxPrice ? Number(req.query.maxPrice) : undefined,
    page: req.query.page ? parseInt(req.query.page, 10) : 1,
    limit: req.query.limit ? parseInt(req.query.limit, 10) : 20,
    categorySlug: req.query.category,
  };
  const result = await productService.find(queryParams);
  res.locals.message = "Get products success!";
  return res.status(StatusCodes.OK).json(result);
});

const findById = catchAsync(async (req, res) => {
  const product = await productService.findById(req.params.id);
  res.locals.message = "Get product details success!";
  return res.status(StatusCodes.OK).json(product);
});

const create = catchAsync(async (req, res) => {
  const newProduct = await productService.create(req.body);
  res.locals.message = "Product created successfully!";
  return res.status(StatusCodes.CREATED).json(newProduct);
});

const update = catchAsync(async (req, res) => {
  const updatedProduct = await productService.update(req.params.id, req.body);
  res.locals.message = "Product updated successfully!";
  return res.status(StatusCodes.OK).json(updatedProduct);
});

const remove = catchAsync(async (req, res) => {
  const result = await productService.remove(req.params.id);
  res.locals.message = "Product deleted successfully!";
  return res.status(StatusCodes.OK).json(result);
});

const addRating = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payload = {
      comment: req.body.comment,
      images: req.body.images || [],
      postedBy: req.body.postedBy || null,
    };

    if (req.body.star !== undefined && req.body.star !== null) {
      payload.star = Number(req.body.star);
    }

    myLogger.debug(
      `[addRating Controller] Payload: ${JSON.stringify(payload)}`
    );

    const userId = req.user?._id || req.user?.id || null;
    const result = await productService.addRating(id, payload, userId);
    res.locals.message = "Rating added";
    return res.status(StatusCodes.CREATED).json(result);
  } catch (err) {
    next(err);
  }
};

const getRatings = async (req, res, next) => {
  try {
    const { id } = req.params;
    const page = req.query.page ? parseInt(req.query.page, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 20;
    const result = await productService.listRatings(id, page, limit);
    res.locals.message = "Ratings fetched";
    return res.status(StatusCodes.OK).json(result);
  } catch (err) {
    next(err);
  }
};

const updateRating = async (req, res, next) => {
  try {
    const { id, ratingId } = req.params;
    const updateData = {};
    if (req.body.star !== undefined) updateData.star = Number(req.body.star);
    if (req.body.comment !== undefined) updateData.comment = req.body.comment;

    const isAdmin = req.user?.role === ROLE[1];
    const userId = req.user?._id || req.user?.id;

    const result = await productService.updateRating(
      id,
      ratingId,
      updateData,
      isAdmin,
      userId
    );
    res.locals.message = "Rating updated";
    return res.status(StatusCodes.OK).json(result);
  } catch (err) {
    next(err);
  }
};

const removeRating = async (req, res, next) => {
  try {
    const { id, ratingId } = req.params;
    // Lấy thông tin user từ req để kiểm tra quyền
    const isAdmin = req.user?.role === ROLE[1];
    const userId = req.user?._id || req.user?.id;
    const result = await productService.removeRating(
      id,
      ratingId,
      isAdmin,
      userId
    );
    res.locals.message = "Rating removed";
    return res.status(StatusCodes.OK).json(result);
  } catch (err) {
    next(err);
  }
};

// VARIANTS
const addVariant = catchAsync(async (req, res) => {
  const { id } = req.params;
  const variantData = req.body;
  const updatedProduct = await productService.addVariant(id, variantData);
  res.locals.message = "Variant added successfully!";
  return res.status(StatusCodes.OK).json(updatedProduct);
});

const updateVariant = catchAsync(async (req, res) => {
  const { id, variantId } = req.params;
  const variantData = req.body;
  const updatedProduct = await productService.updateVariant(
    id,
    variantId,
    variantData
  );
  res.locals.message = "Variant updated successfully!";
  return res.status(StatusCodes.OK).json(updatedProduct);
});

const removeVariant = catchAsync(async (req, res) => {
  const { id, variantId } = req.params;
  const updatedProduct = await productService.removeVariant(id, variantId);
  res.locals.message = "Variant removed successfully!";
  return res.status(StatusCodes.OK).json(updatedProduct);
});

export const productController = {
  find,
  findById,
  create,
  update,
  remove,
  addRating,
  getRatings,
  updateRating,
  removeRating,
  addVariant,
  updateVariant,
  removeVariant,
};
