import { StatusCodes } from "http-status-codes";
import { orderService } from "~/services/orderService.js";
import { userService } from "~/services/userService";

const createOrder = async (req, res, next) => {
  try {
    let userId = req.user ? req.user._id : null;
    const orderData = req.body;

    if (!userId) {
      // 1. Lấy email và tên để tạo tài khoản
      const { email, recipientName } = orderData.shippingAddress;

      // 2. Chuẩn bị object địa chỉ cho User mới
      // Copy toàn bộ shippingAddress để giữ lại recipientName, phone, city...
      const addressForUser = { ...orderData.shippingAddress };

      // Xóa trường 'email' vì addressSchema của User không lưu email trong mảng addresses
      delete addressForUser.email;

      // 3. Gọi service với object địa chỉ đầy đủ (bao gồm recipientName)
      userId = await userService.findOrCreateUserForGuest({
        email,
        fullName: recipientName,
        address: addressForUser,
      });
    }

    // Tạo đơn hàng với userId (dù là cũ hay mới tạo)
    const newOrder = await orderService.createOrder(userId, orderData);

    res.locals.message = "Order created successfully!";
    res.locals.data = newOrder;
    return res.status(StatusCodes.CREATED).json(newOrder);
  } catch (error) {
    next(error);
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const page = req.query.page ? parseInt(req.query.page, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;

    const result = await orderService.getMyOrders(userId, page, limit);

    res.locals.message = "Get my orders success!";
    res.locals.data = result;
    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const order = await orderService.getOrderById(userId, id);

    res.locals.message = "Get order details success!";
    res.locals.data = order;
    return res.status(StatusCodes.OK).json(order);
  } catch (error) {
    next(error);
  }
};

// Admin controllers
const getAllOrders = async (req, res, next) => {
  try {
    const page = req.query.page ? parseInt(req.query.page, 10) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 10;
    const status = req.query.status;

    const result = await orderService.getAllOrders(page, limit, status);

    res.locals.message = "Get all orders success!";
    res.locals.data = result;
    return res.status(StatusCodes.OK).json(result);
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedOrder = await orderService.updateOrderStatus(id, status);

    res.locals.message = "Update order status success!";
    res.locals.data = updatedOrder;
    return res.status(StatusCodes.OK).json(updatedOrder);
  } catch (error) {
    next(error);
  }
};

export const orderController = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
};
