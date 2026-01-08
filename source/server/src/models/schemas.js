import mongoose from "mongoose";
import {
  PRODUCT_STATUS,
  ROLE,
  USER_STATUS,
  DISCOUNT,
  ORDER,
} from "../utils/constants.js";
import { validate } from "~/validations/validator.js";

export const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String },
    imageUrl: { type: String },
    parentCategoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
    versionKey: false,
  }
);

export const brandSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String },
    logoUrl: { type: String },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: false },
    versionKey: false,
  }
);

const variantSchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, trim: true },
    variantName: { type: String, required: true, trim: true },
    priceAdjustment: { type: Number, required: true, default: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    // Trường này để lưu data: { "Màu sắc": "Đỏ", "Kích cỡ": "M" }
    attributes: {
      type: Map,
      of: String,
      default: {},
    },
    specifications: {
      type: Map,
      of: String,
      default: {},
    },
    images: [{ type: String }],
    status: {
      type: String,
      enum: PRODUCT_STATUS,
      default: PRODUCT_STATUS[0],
    },
  },
  { _id: true, timestamps: true }
);

// Rating subdocument schema (kept separate so it can be reused or referenced)
export const ratingSchema = new mongoose.Schema(
  {
    star: { type: Number, min: 1, max: 5 },
    comment: { type: String },
    images: { type: [String], default: [] },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true, versionKey: false }
);

export const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    images: [{ type: String, required: true }],
    price: { type: Number, required: true, min: 0 },
    // Các tiêu đề/tùy chọn biến thể: ["Màu sắc", "Kích thước"]
    variantOptions: {
      type: [String],
      default: [],
    },
    variants: {
      type: [variantSchema],
      default: [],
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    brandId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },
    specifications: {
      type: Map,
      of: String,
      default: {},
    },
    attributes: {
      type: Map,
      of: String,
      default: {},
    },
    status: {
      type: String,
      enum: PRODUCT_STATUS,
      default: PRODUCT_STATUS[0],
    },
    ratings: { type: [ratingSchema], default: [] },
    totalRating: { type: Number, default: 0 },
    avgStar: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false, minimize: false }
);

export const addressSchema = new mongoose.Schema(
  {
    recipientName: { type: String, required: true },
    phone: { type: String },
    city: { type: String, required: true },
    district: { type: String, required: true },
    ward: { type: String, required: true },
    street: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false }
);

export const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      match: validate.email,
    },
    password: { type: String, required: true, match: validate.password },
    avatar: { type: String, default: "" },
    fullName: { type: String, required: true, match: validate.fullName },
    emailVerifiedAt: { type: Date },
    loyaltyPoints: { type: Number, default: 0 },
    status: { type: String, enum: USER_STATUS, default: USER_STATUS[0] },
    role: { type: String, enum: ROLE, default: ROLE[0] },
    addresses: { type: [addressSchema], default: [] },
  },
  { timestamps: true, versionKey: false }
);

export const newUserSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      match: validate.email,
    },
    password: { type: String, required: true, match: validate.password },
    avatar: { type: String, default: "" },
    fullName: { type: String, required: true, match: validate.fullName },
    emailVerifiedAt: { type: Date },
    loyaltyPoints: { type: Number, default: 0 },
    status: { type: String, enum: USER_STATUS, default: USER_STATUS[0] },
    role: { type: String, enum: ROLE, default: ROLE[0] },
    addresses: { type: [addressSchema], default: [] },
  },
  { timestamps: true, versionKey: false, collection: "users" }
);

export const discountSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String },
    discountValue: { type: Number, required: true, min: 0 },
    type: {
      type: String,
      enum: DISCOUNT.DISCOUNT_TYPE,
      required: true,
      default: DISCOUNT.DISCOUNT_TYPE[0],
    },
    usageLimitTotal: { type: Number, required: true, default: 0 },
    usageLimitPerCustomer: { type: Number, default: 0 },
    usedCount: { type: Number, default: 0 },
    validFrom: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    usages: { type: [discountUsageSchema], default: [] },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

const discountUsageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
  },
  { timestamps: false, versionKey: false }
);

export const carts = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        variantId: { type: mongoose.Schema.Types.ObjectId, required: true },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
  },
  { timestamps: true, versionKey: false }
);

const orderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    variantId: { type: mongoose.Schema.Types.ObjectId, required: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 }, // Giá tại thời điểm đặt hàng
    totalPrice: { type: Number, required: true, min: 0 }, // unitPrice * quantity
  },
  { timestamps: false, versionKey: false }
);

const paymentDetailsSchema = new mongoose.Schema(
  {
    method: {
      type: String,
      enum: ORDER.PAYMENT_METHODS,
      required: true,
      default: ORDER.PAYMENT_METHODS[0],
    },
    paidAt: { type: Date }, // Thời gian thanh toán (có thể null nếu COD)
    transactionId: { type: String }, // Mã giao dịch từ cổng thanh toán
  },
  { timestamps: false, versionKey: false }
);

export const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderNumber: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ORDER.ORDER_STATUS,
      default: ORDER.ORDER_STATUS[0],
    },
    subtotalAmount: { type: Number, required: true, min: 0 }, // Tổng tiền hàng ban đầu
    discountAmount: { type: Number, required: true, min: 0 }, // Tiền giảm giá
    taxAmount: { type: Number, required: true, min: 0 }, // Tiền thuế
    shippingAmount: { type: Number, required: true, min: 0 }, // Phí vận chuyển
    totalAmount: { type: Number, required: true, min: 0 }, // Tổng thanh toán cuối cùng
    discountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Discount",
      default: null,
    },
    items: { type: [orderItemSchema], required: true },
    shippingAddress: { type: addressSchema, required: true },
    paymentDetails: { type: paymentDetailsSchema, required: true },
    notes: { type: String },
  },
  { timestamps: true, versionKey: false }
);
