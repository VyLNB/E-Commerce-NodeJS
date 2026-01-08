import { Product } from "@/lib/types";
import React from "react";

type Props = {
  product: Product;
  specs?: Record<string, string>;
};

export default function ProductSpecifications({ product, specs }: Props) {
  const specificationsToRender = specs || product.specifications;

  return (
    <section id="specifications" className="scroll-mt-20">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Thông số kỹ thuật
      </h2>
      {specificationsToRender &&
      Object.keys(specificationsToRender).length > 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          <dl className="divide-y divide-gray-200">
            {Object.entries(specificationsToRender).map(
              ([key, value], index) => (
                <div
                  key={key}
                  className={`px-6 py-4 grid grid-cols-3 gap-4 ${
                    index % 2 === 0 ? "bg-white" : "bg-gray-50"
                  }`}
                >
                  <dt className="font-medium text-gray-800">{key}</dt>
                  <dd className="text-gray-600 col-span-2">{value}</dd>
                </div>
              )
            )}
          </dl>
        </div>
      ) : (
        <p className="mt-4 text-gray-500">
          Thông số kỹ thuật của sản phẩm này chưa được cập nhật.
        </p>
      )}
    </section>
  );
}
