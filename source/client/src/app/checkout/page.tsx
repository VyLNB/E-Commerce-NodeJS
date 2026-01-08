"use client";

import { useState, useCallback, useEffect } from "react";
import { Tab, TabGroup, TabPanel, TabPanels } from "@headlessui/react";
import {
  AddressStep,
  CheckoutProgress,
  OrderSummary,
  PaymentStep,
  ShippingStep,
} from "@/components/checkout";
import Link from "next/link";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import { createOrder, OrderSubmissionPayload } from "@/api/order";
import { Address } from "@/lib/types";
import { toast } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import { clearCart } from "@/lib/features/cart-slice";
import { useSocket } from "@/hooks/use-socket";

// ... (Interface definitions remain the same) ...
interface ShippingAddressData
  extends Pick<
    Address,
    "recipientName" | "phone" | "city" | "district" | "ward" | "street"
  > {}

interface CheckoutDataState {
  shippingAddress: ShippingAddressData | null;
  paymentMethod: string;
  notes: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cartItems = useAppSelector((state) => state.cart.items);
  const dispatch = useAppDispatch();
  const socket = useSocket();

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isWaitingForWorker, setIsWaitingForWorker] = useState(false);

  // Central Checkout State
  const [checkoutData, setCheckoutData] = useState<CheckoutDataState>({
    shippingAddress: null,
    paymentMethod: "Cash on Delivery",
    notes: "",
  });

  const discountCode = searchParams.get("discountCode");

  // Handlers
  const handleUpdateCheckoutData = useCallback(
    (key: keyof CheckoutDataState, value: any) => {
      setCheckoutData((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleAddressSelect = useCallback(
    (address: Address) => {
      handleUpdateCheckoutData("shippingAddress", address);
    },
    [handleUpdateCheckoutData]
  );

  const handlePaymentMethodSelect = useCallback(
    (methodCode: string) => {
      handleUpdateCheckoutData("paymentMethod", methodCode);
    },
    [handleUpdateCheckoutData]
  );

  // Socket Listener
  useEffect(() => {
    if (!socket || !isWaitingForWorker) return;

    const handleOrderNotification = (data: any) => {
      console.log("Received order notification:", data);

      if (data.status === "success") {
        toast.success("Đơn hàng đã được xử lý thành công!");
        dispatch(clearCart());

        // Redirect to the specific order details or list with status
        router.push(
          `/profile/orders?status=Processing&orderNumber=${data.order.orderNumber}`
        );
      } else if (data.status === "failed") {
        setIsSubmitting(false);
        setIsWaitingForWorker(false);
        toast.error(`Lỗi xử lý đơn hàng: ${data.error}`);
      }
    };

    // Listen to the event name defined in src/providers/websocket.js
    socket.on("order_notification", handleOrderNotification);

    return () => {
      socket.off("order_notification", handleOrderNotification);
    };
  }, [socket, isWaitingForWorker, dispatch, router]);

  const handlePlaceOrder = useCallback(async () => {
    if (!checkoutData.shippingAddress || cartItems.length === 0) {
      toast.error("Vui lòng hoàn tất thông tin địa chỉ và giỏ hàng.");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderItems = cartItems.map((item) => ({
        productId: item.productId,
        variantId: item.id,
        quantity: item.quantity,
      }));

      const { recipientName, phone, city, district, ward, street, email } =
        checkoutData.shippingAddress as any;
      const cleanShippingAddress: ShippingAddressData = {
        recipientName,
        phone,
        city,
        district,
        ward,
        street,
        email,
      };

      const payload: OrderSubmissionPayload = {
        items: orderItems,
        shippingAddress: cleanShippingAddress,
        paymentMethod: checkoutData.paymentMethod,
        discountCode: discountCode || undefined,
        notes: checkoutData.notes || undefined,
      };

      // 1. Submit to API
      const result = await createOrder(payload);
      setIsWaitingForWorker(true);
      toast.info("Đang xử lý đơn hàng, vui lòng đợi giây lát...");
    } catch (error: any) {
      console.error("Order submission failed:", error);
      toast.error(error.message || "Đã xảy ra lỗi khi tạo đơn hàng.");
      setIsSubmitting(false);
    }
  }, [checkoutData, cartItems, discountCode]);

  const buttonText =
    selectedIndex === 0
      ? "Tiếp tục"
      : selectedIndex === 1
      ? "Thanh toán"
      : isSubmitting
      ? "Đang xử lý..."
      : "Đặt hàng";

  const handleNext = () => {
    if (isSubmitting) return;

    if (selectedIndex === 0 && !checkoutData.shippingAddress) {
      toast.error("Vui lòng chọn địa chỉ giao hàng.");
      return;
    }

    if (selectedIndex < 2) {
      setSelectedIndex(selectedIndex + 1);
    } else {
      handlePlaceOrder();
    }
  };

  const handleBack = () => {
    if (selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  if (cartItems.length === 0 && !isSubmitting) {
    return (
      <div className="bg-white">
        <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-32 text-center ">
          <p className="text-gray-600">Giỏ hàng của bạn đang trống.</p>
          <Link
            href="/products"
            className="mt-4 inline-block bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition"
          >
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-32">
        <TabGroup selectedIndex={selectedIndex} onChange={setSelectedIndex}>
          <Tab className="hidden">Address</Tab>
          <Tab className="hidden">Shipping</Tab>
          <Tab className="hidden">Payment</Tab>

          <div className="flex justify-center mb-16">
            <CheckoutProgress currentStep={selectedIndex} />
          </div>

          <div className="grid grid-cols-1 gap-x-12 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <TabPanels>
                <TabPanel>
                  <AddressStep onSelectAddress={handleAddressSelect} />
                </TabPanel>
                <TabPanel>
                  <ShippingStep />
                </TabPanel>
                <TabPanel>
                  <PaymentStep
                    onSelectPaymentMethod={handlePaymentMethodSelect}
                  />
                </TabPanel>
              </TabPanels>

              <div className="mt-10 pt-6 border-t border-gray-200 flex items-center justify-between">
                {selectedIndex > 0 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    disabled={isSubmitting}
                    className="rounded-md border border-gray-300 bg-white py-2 px-4 font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    Quay lại
                  </button>
                ) : (
                  <Link
                    href="/cart"
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    &larr; Quay lại giỏ hàng
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={isSubmitting || cartItems.length === 0}
                  className="cursor-pointer transition rounded-md border border-transparent bg-gray-900 py-2 px-8 font-medium text-white shadow-sm hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:bg-gray-500 disabled:cursor-not-allowed"
                >
                  {buttonText}
                </button>
              </div>
            </div>
            <div className="lg:col-span-1 mt-10 lg:mt-0">
              <OrderSummary />
            </div>
          </div>
        </TabGroup>
      </div>
    </div>
  );
}
