// src/components/checkout/payment-step.tsx

"use client";

import { Radio, RadioGroup } from "@headlessui/react";
import clsx from "clsx";
import { Banknote, CreditCard, Landmark, Wallet } from "lucide-react";
import React, { useState, useEffect } from "react";

// Định nghĩa phương thức thanh toán khớp với Server constants
const PAYMENT_METHODS = [
  {
    id: "cod",
    name: "Thanh toán khi nhận hàng (COD)",
    description: "Thanh toán bằng tiền mặt khi giao hàng.",
    code: "Cash on Delivery", // Giá trị này phải khớp với Server
    icon: Banknote,
  },
  {
    id: "bank",
    name: "Chuyển khoản ngân hàng",
    description: "Chuyển khoản thủ công qua STK hoặc QR Code.",
    code: "Bank", // Giá trị này phải khớp với Server
    icon: Landmark,
  },
];

interface Props {
  onSelectPaymentMethod: (methodCode: string) => void;
}

export default function PaymentStep({ onSelectPaymentMethod }: Props) {
  const [selectedMethod, setSelectedMethod] = useState(PAYMENT_METHODS[0]);

  const handleMethodChange = (newMethod: (typeof PAYMENT_METHODS)[0]) => {
    setSelectedMethod(newMethod);
    onSelectPaymentMethod(newMethod.code);
  };

  // Trigger lần đầu để set giá trị mặc định lên cha
  useEffect(() => {
    onSelectPaymentMethod(selectedMethod.code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-gray-900">
          Thông tin thanh toán
        </h2>
        <p className="text-sm text-gray-600">
          Mọi giao dịch đều được bảo mật và mã hóa.
        </p>
      </div>

      <RadioGroup
        value={selectedMethod}
        onChange={handleMethodChange}
        className="space-y-4"
      >
        {PAYMENT_METHODS.map((method) => (
          <Radio
            key={method.id}
            value={method}
            className={({ checked }) =>
              clsx(
                "relative block cursor-pointer rounded-xl border p-4 shadow-sm focus:outline-none transition-all duration-200",
                checked
                  ? "border-blue-600 ring-1 ring-blue-600 bg-blue-50/50"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              )
            }
          >
            {({ checked }) => (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={clsx(
                        "p-2 rounded-lg",
                        checked
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-500"
                      )}
                    >
                      <method.icon size={24} />
                    </div>
                    <div>
                      <span
                        className={clsx(
                          "block text-base font-semibold",
                          checked ? "text-blue-900" : "text-gray-900"
                        )}
                      >
                        {method.name}
                      </span>
                      <span className="block text-sm text-gray-500 mt-0.5">
                        {method.description}
                      </span>
                    </div>
                  </div>
                  {checked && (
                    <div className="text-blue-600">
                      <CreditCard size={20} />
                    </div>
                  )}
                </div>

                {/* Phần hiển thị chi tiết cho Chuyển khoản */}
                {checked && method.id === "bank" && (
                  <div className="mt-4 pt-4 border-t border-blue-200 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-3">
                      <p className="text-sm font-medium text-gray-900">
                        Thông tin chuyển khoản:
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Ngân hàng</p>
                          <p className="font-semibold text-gray-800">
                            Vietcombank
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Số tài khoản</p>
                          <p className="font-semibold text-gray-800">
                            0123456789
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Chủ tài khoản</p>
                          <p className="font-semibold text-gray-800">
                            GEARUP STORE
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Nội dung</p>
                          <p className="font-semibold text-blue-600">
                            SĐT Đặt Hàng
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-500 italic bg-gray-50 p-2 rounded">
                        * Lưu ý: Đơn hàng sẽ được xử lý sau khi chúng tôi nhận
                        được thanh toán.
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </Radio>
        ))}
      </RadioGroup>
    </div>
  );
}
