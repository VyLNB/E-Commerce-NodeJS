export interface OrderItem {
  _id: string;
  productId: {
    _id: string;
    name: string;
    images: string[];
  };
  variantId: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ShippingAddress {
  _id: string;
  recipientName: string;
  phone: string;
  city: string;
  district: string;
  ward: string;
  street: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}


export interface PaymentDetails {
  _id: string;
  method: string;
  paidAt: string | null;
}

export interface Order {
  _id: string;
  userId: {
    _id: string;
    email: string;
    fullName: string;
  };
  orderNumber: string;
  status: string;
  subtotalAmount: number;
  discountAmount: number;
  taxAmount: number;
  shippingAmount: number;
  totalAmount: number;
  discountId: string | null;
  items: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentDetails: PaymentDetails;
  createdAt: string;
  updatedAt: string;
}

export interface OrdersQueryParams {
    page?: number;
    limit?: number;
    q?: string;
    sort_by?: string;
}

export interface PaginationInfo {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}