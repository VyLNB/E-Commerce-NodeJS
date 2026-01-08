import { CartItem } from "@/lib/types";
import { getFlexibleImageUrl } from "@/lib/utils";
import { apiRequest } from "./client";

interface CartActionPayload {
  productId: string;
  variantId: string;
  quantity: number;
}

// NOTE: This interface describes the expected response structure from GET /users/me/cart
interface PopulatedCartApiResponse {
  message: string;
  success: boolean;
  data: {
    items: any[];
  };
}

// Maps server's structured item to client's flat CartItem type
const mapServerCartItemToClient = (serverItem: any): CartItem => {
  const { product, variant, quantity } = serverItem;

  // [FIX] Ensure the populated 'product' object exists before accessing properties.
  // The original error occurred here because the server's mutation response
  // does not include this populated object.
  if (!product || !variant) {
    // Throw error if product or variant fields are missing after population.
    throw new Error(
      "Cannot map cart item: Product or Variant details are missing."
    );
  }

  // Calculate final price: Base Price + Variant Price Adjustment
  const price = product.price + (variant.priceAdjustment || 0);

  return {
    id: variant._id.toString(),
    productId: product._id,
    name: `${product.name} (${variant.variantName})`,
    description: product.description || "Sản phẩm chất lượng cao",
    code: variant.sku,
    price: price,
    quantity: quantity,
    imageUrl: getFlexibleImageUrl(variant.images?.[0] || product.images?.[0]),
    imageAlt: product.name,
  };
};

export async function getCartServer(): Promise<CartItem[]> {
  const response = await apiRequest<PopulatedCartApiResponse>(
    "get",
    `/users/me/cart`
  );
  return response.data.items.map(mapServerCartItemToClient);
}

export async function addToCartServer(
  payload: Pick<CartActionPayload, "productId" | "variantId" | "quantity">
): Promise<CartItem[]> {
  // 1. Call the mutation endpoint (returns unpopulated cart)
  await apiRequest<any>("post", "/users/me/cart", payload);
  // 2. Fetch the newly updated, fully populated cart
  return getCartServer();
}

export async function updateCartItemServer(
  payload: Pick<CartActionPayload, "productId" | "variantId" | "quantity">
): Promise<CartItem[]> {
  // 1. Call the mutation endpoint
  await apiRequest<any>("put", "/users/me/cart", payload);
  // 2. Fetch the newly updated, fully populated cart
  return getCartServer();
}

export async function removeCartItemServer(
  payload: Pick<CartActionPayload, "productId" | "variantId">
): Promise<CartItem[]> {
  // 1. Call the mutation endpoint
  await apiRequest<any>("delete", "/users/me/cart", payload);
  // 2. Fetch the newly updated, fully populated cart
  return getCartServer();
}
