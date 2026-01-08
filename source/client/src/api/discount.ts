import { apiRequest } from "./client";

export interface DiscountValidationResponse {
  _id: string;
  code: string;
  discountValue: number;
  type: "percentage" | "fixed_amount";
}

interface DiscountApiResponse {
  message: string;
  success: boolean;
  data: DiscountValidationResponse;
}

export async function validateDiscountCode(
  code: string
): Promise<DiscountValidationResponse> {
  const response = await apiRequest<DiscountApiResponse>(
    "get",
    `/discounts/${code}`
  );
  return response.data;
}
