import { StatusCodes } from "http-status-codes";
import { cartService } from "~/services/cartService";

const getCart = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const cart = await cartService.getCart(userId);
    res.status(StatusCodes.OK).json(cart);
  } catch (error) {
    next(error);
  }
};

const addToCart = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { productId, variantId, quantity } = req.body;
    const cart = await cartService.addToCart(userId, {
      productId,
      variantId,
      quantity,
    });
    res.status(StatusCodes.OK).json(cart);
  } catch (error) {
    next(error);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { productId, variantId, quantity } = req.body;
    const cart = await cartService.updateCartItem(userId, {
      productId,
      variantId,
      quantity,
    });
    res.status(StatusCodes.OK).json(cart);
  } catch (error) {
    next(error);
  }
};

const removeCartItem = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { productId, variantId } = req.body; // Hoặc params tùy route
    const cart = await cartService.removeCartItem(userId, {
      productId,
      variantId,
    });
    res.status(StatusCodes.OK).json(cart);
  } catch (error) {
    next(error);
  }
};

export const cartController = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
};
