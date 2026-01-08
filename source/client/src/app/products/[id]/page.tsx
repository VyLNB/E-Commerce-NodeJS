import { getProductById } from "@/api/product";
import ProductDetailClient from "@/components/product/product-detail-client";
import { notFound } from "next/navigation";

type Props = {
  params: { id: string };
};

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;

  if (!id) {
    notFound(); // Trả về trang 404 nếu không có ID
  }

  try {
    const response = await getProductById(id);

    if (!response.success || !response.data) {
      notFound();
    }

    return <ProductDetailClient initialProduct={response.data} />;
  } catch (error) {
    console.error("Failed to fetch product:", error);
    notFound();
  }
}
