import React from "react";
import Image from "next/image";
import iphoneImage from "@/public/images/iphone-image.png";

export default function Banner1() {
  return (
    <section className="bg-[#121113] text-white">
      <div className="container mx-auto px-4 lg:px-32 flex flex-col lg:flex-row items-center justify-between">
        <div className="lg:w-1/2 text-center lg:text-left mb-10 lg:mb-0 order-2 lg:order-1">
          <p className="text-sm sm:text-lg text-gray-400 mb-2">Pro.Beyond.</p>

          <h1 className="text-4xl sm:text-6xl lg:text-8xl font-semibold mb-4">
            iPhone 14 <span className="font-bold">Pro</span>
          </h1>

          <p className="text-sm sm:text-lg text-gray-400 mb-8 max-w-md mx-auto lg:mx-0">
            Được thiết kế để nâng cao trải nghiệm người dùng, sản phẩm dành cho
            mọi người.
          </p>
          <button className="border border-white text-white px-8 py-3 rounded-lg hover:bg-white hover:text-black transition-colors duration-300">
            Mua sắm ngay
          </button>
        </div>

        <div className="lg:w-1/3 flex justify-center w-full max-w-sm sm:max-w-md lg:max-w-none order-1 lg:order-2 mb-8 lg:mb-0">
          <Image
            src={iphoneImage}
            alt="iPhone 14 Pro"
            className="w-full h-auto object-contain"
            sizes="(max-width: 1024px) 80vw, 50vw"
            priority={true}
          />
        </div>
      </div>
    </section>
  );
}
