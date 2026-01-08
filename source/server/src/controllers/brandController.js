import { StatusCodes } from "http-status-codes";
import { brandService } from "~/services/brandService.js";
import catchAsync from "~/utils/catchAsync";
import getQueryParams from "~/utils/getQueryParams";

const create = async (req, res, next) => {
  try {
    const newBrand = await brandService.create(req.body);
    res.status(StatusCodes.CREATED).json(newBrand);
  } catch (error) {
    next(error);
  }
};

const getAllForClient = catchAsync(async (req, res) => {
  const queryParams = getQueryParams(req);
  const result = await brandService.find(queryParams, true);
  res.locals.message = "Get active brands success!";
  res.status(StatusCodes.OK).json(result);
});

const getAllForAdmin = catchAsync(async (req, res) => {
  const queryParams = getQueryParams(req);
  const result = await brandService.find(queryParams, false);
  res.locals.message = "Get all brands success!";
  res.status(StatusCodes.OK).json(result);
});

const getById = async (req, res, next) => {
  try {
    const brand = await brandService.findById(req.params.id);
    res.status(StatusCodes.OK).json(brand);
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const updatedBrand = await brandService.update(req.params.id, req.body);
    res.status(StatusCodes.OK).json(updatedBrand);
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const result = await brandService.remove(req.params.id);
    res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

export const brandController = {
  create,
  getAllForClient,
  getAllForAdmin,
  getById,
  update,
  remove,
};
