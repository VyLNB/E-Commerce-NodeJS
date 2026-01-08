import { StatusCodes } from "http-status-codes";
import { discountService } from "~/services/discountService.js";
import catchAsync from "~/utils/catchAsync.js";

const createDiscount = catchAsync(async (req, res) => {
  const discountData = req.body;
  const result = await discountService.create(discountData);
  res.locals.message = "Discount created successfully";
  res.status(StatusCodes.CREATED).json(result);
});

const getAllDiscounts = catchAsync(async (req, res) => {
  const result = await discountService.getAll(req.query);
  res.locals.message = "Discounts fetched successfully";
  res.status(StatusCodes.OK).json(result);
});

const validateDiscountForOrder = catchAsync(async (req, res) => {
  const { code } = req.params;
  const result = await discountService.validateDiscountForOrder(code);
  res.locals.message = "Discount validated successfully";
  res.status(StatusCodes.OK).json(result);
});

const update = catchAsync(async (req, res) => {
  const { discountId } = req.params;
  const updateData = req.body;
  const result = await discountService.update(discountId, updateData);
  res.locals.message = "Discount updated successfully";
  res.status(StatusCodes.OK).json(result);
});

const disable = catchAsync(async (req, res) => {
  const { discountId } = req.params;
  const result = await discountService.disable(discountId);
  res.locals.message = "Discount disabled successfully";
  res.status(StatusCodes.OK).json(result);
});

export const discountController = {
  createDiscount,
  getAllDiscounts,
  validateDiscountForOrder,
  update,
  disable,
};
