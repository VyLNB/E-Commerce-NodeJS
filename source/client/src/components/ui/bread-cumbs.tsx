"use client";

import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import React, { Fragment } from "react";

type BreadcrumbItem = {
  name: string;
  href: string;
};

type Props = {
  items: BreadcrumbItem[];
};

export default function BreadCumbs({ items }: Props) {
  return (
    <nav className="flex items-center text-gray-500 mb-8 text-sm">
      <Link href="/" className="hover:text-gray-700 flex items-center gap-2">
        <Home size={16} />
        Trang chủ
      </Link>

      {items.map((item, index) => (
        <Fragment key={item.name}>
          <ChevronRight className="mx-2 h-4 w-4" />
          <Link
            href={item.href}
            className={`hover:text-gray-700 ${
              // Item cuối cùng sẽ có màu đậm hơn
              index === items.length - 1
                ? "text-gray-800 font-semibold pointer-events-none"
                : ""
            }`}
          >
            {item.name}
          </Link>
        </Fragment>
      ))}
    </nav>
  );
}
