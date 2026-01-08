"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Countdown from "react-countdown";
import { ProductCard } from ".";

type Props = {};

const renderer = ({ days, hours, minutes, seconds, completed }) => {
  if (completed) {
    // Render a completed state
    return <span>Sale has ended!</span>;
  } else {
    // Render the countdown timer
    return (
      <div className="flex space-x-1 items-center gap-2 sm:gap-4 text-sm sm:text-lg font-semibold text-gray-900">
        {" "}
        <div className="flex flex-col items-center">
          <span className="text-xs sm:text-sm">Ngày</span>{" "}
          <span className="text-lg lg:text-2xl">
            {" "}
            {String(days).padStart(2, "0")}
          </span>
        </div>
        <span className="text-red-500 text-lg">:</span>{" "}
        <div className="flex flex-col items-center">
          <span className="text-xs sm:text-sm">Giờ</span>
          <span className="text-lg lg:text-2xl">
            {String(hours).padStart(2, "0")}
          </span>
        </div>
        <span className="text-red-500 text-lg">:</span>
        <div className="flex flex-col items-center">
          <span className="text-xs sm:text-sm">Phút</span>
          <span className="text-lg lg:text-2xl">
            {String(minutes).padStart(2, "0")}
          </span>
        </div>
        <span className="text-red-500 text-lg">:</span>
        <div className="flex flex-col items-center">
          <span className="text-xs sm:text-sm">Giây</span>
          <span className="text-lg lg:text-2xl">
            {String(seconds).padStart(2, "0")}
          </span>
        </div>
      </div>
    );
  }
};

export default function FlashSales({}: Props) {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 2);

  return (
    <section className="py-12 lg:py-24">
      <div className="container mx-auto px-4 sm:px-8 md:px-16 lg:px-32 space-y-12">
        <div className="flex flex-col lg:flex-row lg:items-end text-center lg:justify-between">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-x-8 gap-y-4 mb-6 lg:mb-0">
            <h2 className="text-center text-nowrap md:text-left text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
              Flash Sales
            </h2>
            {/* Countdown */}
            <div className="min-w-[200px] flex items-center justify-center md:justify-start">
              <Countdown date={endDate} renderer={renderer} />
            </div>
          </div>

          <div className="flex justify-center lg:justify-end items-center space-x-4">
            <div className="flex gap-4 md:gap-2">
              <button className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:border-gray-500 hover:text-gray-900 transition-colors">
                <ChevronLeft size={16} />
              </button>
              <button className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:border-gray-500 hover:text-gray-900 transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <ProductCard />
          <ProductCard />
          <ProductCard />
          <ProductCard />
        </div>

        <div className="flex justify-center items-center">
          <a
            href="#"
            className="border border-gray-900 px-8 py-3 rounded-lg text-base font-medium text-gray-900 hover:border-red-500 hover:text-red-500 transition-colors whitespace-nowrap"
          >
            Xem tất cả
          </a>
        </div>
      </div>
    </section>
  );
}
