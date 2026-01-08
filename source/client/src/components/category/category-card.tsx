import Image, { StaticImageData } from "next/image";
import Link from "next/link";
import React from "react";

type Props = {
  title: string;
  description: string;
  imageUrl: StaticImageData;
  alt?: string;
  href: string;
};

export default function CategoryCard({
  title,
  description,
  imageUrl,
  href,
}: Props) {
  return (
    <Link
      href={href}
      className="block w-full p-6 border border-gray-300 bg-white rounded-lg shadow-sm shadow-red-100 hover:shadow-lg transition-shadow duration-300"
    >
      <div className="flex items-center space-x-4">
        <Image
          src={imageUrl}
          alt={title}
          className="object-contain"
          width={96}
          height={96}
        />
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{title}</h3>
          <p className="text-gray-600">{description}</p>
        </div>
      </div>
    </Link>
  );
}
