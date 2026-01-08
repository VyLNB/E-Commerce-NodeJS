import { StatusCodes } from "http-status-codes";
import { categoryService } from "~/services/categoryService.js";
import catchAsync from "~/utils/catchAsync";
import getQueryParams from "~/utils/getQueryParams";

const create = async (req, res, next) => {
  try {
    const newCategory = await categoryService.create(req.body);
    res.status(StatusCodes.CREATED).json(newCategory);
  } catch (error) {
    next(error);
  }
};

const getAllForClient = catchAsync(async (req, res) => {
  const queryParams = getQueryParams(req);
  const result = await categoryService.find(queryParams, true);
  res.locals.message = "Get active categories success!";
  res.status(StatusCodes.OK).json(result);
});

const getAllForAdmin = catchAsync(async (req, res) => {
  const queryParams = getQueryParams(req);
  const result = await categoryService.find(queryParams, false);
  res.locals.message = "Get all categories success!";
  res.status(StatusCodes.OK).json(result);
});

const getById = async (req, res, next) => {
  try {
    const category = await categoryService.findById(req.params.id);
    res.status(StatusCodes.OK).json(category);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const updatedCategory = await categoryService.update(
      req.params.id,
      req.body
    );
    res.status(StatusCodes.OK).json(updatedCategory);
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const result = await categoryService.remove(req.params.id);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

export const categoryController = {
  create,
  getAllForClient,
  getAllForAdmin,
  getById,
  update,
  remove,
};
