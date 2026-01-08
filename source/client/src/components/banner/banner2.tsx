import React from "react";
import bannerBackdrop from "@/public/images/banner-backdrop.png";
import Image from "next/image";

type Props = {};

export default function Banner2({}: Props) {
  return (
    <section className="relative text-white">
      <Image
        src={bannerBackdrop}
        alt="Big Summer Sale Banner Backdrop"
        fill
        className="object-cover object-center"
      />

      <div className="relative z-10 flex flex-col items-center justify-center py-16 lg:py-32 px-4 md:px-8 text-center">
        <h1 className="mb-4 text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight space-x-0 sm:space-x-4">
          <span className="text-white whitespace-nowrap">Big Summer Sale</span>
        </h1>

        <p className="mb-8 max-w-xs sm:max-w-sm font-light text-gray-400 text-sm sm:text-base md:text-lg">
          Commodo fames vitae leo mauris in. Eu consequat.
        </p>

        <button className="rounded-lg border border-white px-8 py-3 font-semibold text-white transition-colors duration-300 hover:bg-white hover:text-gray-900">
          Shop Now
        </button>
      </div>
    </section>
  );
}
