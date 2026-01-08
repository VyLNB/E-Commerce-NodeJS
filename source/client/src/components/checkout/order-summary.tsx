"use client";
import { useAppSelector } from "@/lib/hooks";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

export default function OrderSummary() {
  const cartItems = useAppSelector((state) => state.cart.items);
  const subtotal = useMemo(() => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  }, [cartItems]);

  const shipping = 25; // Example shipping cost
  const total = subtotal + shipping;

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Order Summary
      </h2>
      <div className="space-y-4 max-h-64 overflow-y-auto">
        {cartItems.map((item) => (
          <div key={item.id} className="flex items-center gap-4">
            <Link href={`/products/${item.productId}?variant=${item.id}`}>
              <Image
                src={item.imageUrl}
                alt={item.name}
                width={64}
                height={64}
                className="rounded-md object-cover"
              />
            </Link>
            <div className="flex-grow">
              <Link href={`/products/${item.productId}?variant=${item.id}`}>
                <p className="font-medium text-gray-800 hover:text-blue-600 transition">
                  {item.name}
                </p>
              </Link>
              <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
            </div>
            <p className="font-semibold text-gray-700">
              {formatCurrency(item.price * item.quantity)}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-6 pt-6 border-t border-gray-200 space-y-4 text-gray-700">
        <div className="flex justify-between">
          <p>Subtotal</p>
          <p className="font-semibold">{formatCurrency(subtotal)}</p>
        </div>
        <div className="flex justify-between">
          <p>Shipping</p>
          <p className="font-semibold">{formatCurrency(shipping)}</p>
        </div>
        <div className="flex justify-between text-lg font-bold text-gray-900">
          <p>Total</p>
          <p>{formatCurrency(total)}</p>
        </div>
      </div>
    </div>
  );
}
