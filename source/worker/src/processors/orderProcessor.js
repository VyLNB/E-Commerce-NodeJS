import mongoose from "mongoose";
import { StatusCodes } from "http-status-codes";
import { orderModel } from "../models/orderModel.js";
import { productModel } from "../models/productModel.js";
import { discountModel } from "../models/discountModel.js";
import { userModel } from "../models/userModel.js";
// import { cartModel } from "../models/cartModel.js"; // [ACTION: REMOVE UNUSED IMPORT]
import { generateOrderNumber } from "../utils/random.js";
import { ORDER } from "../utils/constants.js";
import ApiError from "../utils/ApiError.js";
import { myLogger } from "../loggers/myLogger.js";
import { redisPublisher } from "../configs/redis.js";
import { sendOrderConfirmationEmail } from "../emailProvider.js";

export const orderProcessor = async (job) => {
  const { userId, orderData } = job.data;
  const {
    items,
    shippingAddress,
    paymentMethod,
    discountCode,
    notes,
    pointsToUse,
  } = orderData;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    myLogger.info(`Processing order for user ${userId}, Job ID: ${job.id}`);

    // 1. Validate products...
    let subtotalAmount = 0;
    const orderItems = [];
    const emailItems = [];

    for (const item of items) {
      // Find product
      const product = await productModel
        .findById(item.productId)
        .session(session);
      if (!product) {
        throw new ApiError(
          StatusCodes.NOT_FOUND,
          `Product not found: ${item.productId}`
        );
      }

      // Find variant
      const variant = product.variants.find(
        (v) => v._id.toString() === item.variantId
      );
      if (!variant) {
        throw new ApiError(
          StatusCodes.NOT_FOUND,
          `Variant not found: ${item.variantId}`
        );
      }

      // Check stock
      if (variant.stock < item.quantity) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          `Insufficient stock for product: ${product.name} (${variant.variantName})`
        );
      }

      // Calculate price (base price + variant adjustment)
      const unitPrice = product.price + variant.priceAdjustment;
      const totalPrice = unitPrice * item.quantity;
      subtotalAmount += totalPrice;

      orderItems.push({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
      });

      emailItems.push({
        productName: product.name,
        variantName: variant.variantName,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
      });

      // Deduct stock
      variant.stock -= item.quantity;
      // Update product in DB (within transaction)
      await product.save({ session });
    }

    // 2. Apply Discount
    let discountAmount = 0;
    let discountId = null;

    if (discountCode) {
      const discount = await discountModel.Discount.findOne({
        code: discountCode.trim(),
        isActive: true,
        validFrom: { $lte: new Date() },
      }).session(session);

      if (!discount) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid discount code");
      }

      if (discount.usageLimitTotal <= discount.usedCount) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          "Discount code usage limit exceeded"
        );
      }

      if (discount.type === "percentage") {
        discountAmount = (subtotalAmount * discount.discountValue) / 100;
      } else if (discount.type === "fixed_amount") {
        discountAmount = discount.discountValue;
      }

      if (discountAmount > subtotalAmount) {
        discountAmount = subtotalAmount;
      }

      discountId = discount._id;
      discount.usedCount += 1;
      await discount.save({ session });
    }

    // 2.5 Apply Loyalty Points
    const user = await userModel.User.findById(userId).session(session);
    if (!user) throw new ApiError(StatusCodes.NOT_FOUND, "User not found");

    let pointDiscount = 0;
    const pointsToRedeem = parseInt(pointsToUse || 0);

    if (pointsToRedeem > 0) {
      if (user.loyaltyPoints < pointsToRedeem) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          "Insufficient loyalty points"
        );
      }
      pointDiscount = pointsToRedeem * 1000; // 1 point = 1000 VND

      // Cap discount
      if (discountAmount + pointDiscount > subtotalAmount) {
        pointDiscount = subtotalAmount - discountAmount;
        if (pointDiscount < 0) pointDiscount = 0;
      }

      user.loyaltyPoints -= pointsToRedeem;
    }
    discountAmount += pointDiscount;

    // 3. Calculate final total
    const taxAmount = 0;
    const shippingAmount = 0;
    const totalAmount =
      subtotalAmount - discountAmount + taxAmount + shippingAmount;

    // 3.5 Earn Points (10% value -> 1 point per 10,000 VND)
    const pointsEarned = Math.floor(totalAmount / 10000);
    user.loyaltyPoints += pointsEarned;
    await user.save({ session });

    // 4. Create Order
    const orderNumber = generateOrderNumber();
    const initialStatus =
      paymentMethod === ORDER.PAYMENT_METHODS[0]
        ? ORDER.ORDER_STATUS[1]
        : ORDER.ORDER_STATUS[0];

    const newOrderData = {
      userId,
      orderNumber,
      status: initialStatus,
      subtotalAmount,
      discountAmount,
      taxAmount,
      shippingAmount,
      totalAmount,
      discountId,
      items: orderItems,
      shippingAddress,
      paymentDetails: {
        method: paymentMethod,
        paidAt: null,
      },
      notes,
    };

    const orders = await orderModel.Order.create([newOrderData], { session });
    const createdOrder = orders[0];

    await session.commitTransaction();
    session.endSession();

    myLogger.info(`Order created successfully: ${createdOrder.orderNumber}`);

    // Notify Success
    await redisPublisher.publish(
      "order_notifications",
      JSON.stringify({
        userId,
        status: "success",
        order: createdOrder,
        message: "Order created successfully",
      })
    );

    // Send Email
    try {
      const user = await userModel.User.findById(userId);
      if (user && user.email) {
        const emailOrderContext = {
          ...createdOrder.toObject(),
          items: emailItems,
          pointsEarned,
          pointsUsed: pointsToRedeem,
          newTotalPoints: user.loyaltyPoints,
        };

        await sendOrderConfirmationEmail(user.email, emailOrderContext);
        myLogger.info(`Order confirmation email sent to ${user.email}`);
      }
    } catch (emailError) {
      myLogger.error(
        `Failed to send order confirmation email: ${emailError.message}`
      );
    }

    return createdOrder;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    myLogger.error(`Order processing failed: ${error.message}`);

    // Notify Failure
    await redisPublisher.publish(
      "order_notifications",
      JSON.stringify({
        userId,
        status: "failed",
        error: error.message,
        message: "Order creation failed",
      })
    );

    throw error;
  }
};
