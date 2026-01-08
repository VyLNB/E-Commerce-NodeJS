import { Address } from "@/lib/types";
import { apiRequest } from "./client";
import { z } from "zod";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const CreateAddressPayloadSchema = z.object({
  recipientName: z.string(),
  phone: z.nullable(z.string()),
  city: z.string(),
  district: z.string(),
  ward: z.string(),
  street: z.string(),
  isDefault: z.boolean(),
});

export type CreateAddressPayload = z.infer<typeof CreateAddressPayloadSchema>;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const UpdateAddressPayloadSchema = CreateAddressPayloadSchema.partial();
export type UpdateAddressPayload = z.infer<typeof UpdateAddressPayloadSchema>;

interface AddressesApiResponse {
  message: string;
  success: boolean;
  error: boolean;
  data: Address[];
}

export async function saveAddress(
  user_id: string,
  credentials: CreateAddressPayload
): Promise<AddressesApiResponse> {
  return apiRequest<AddressesApiResponse>(
    "post",
    `/users/${user_id}/addresses`,
    credentials
  );
}

export async function updateAddress(
  user_id: string,
  address_id: number,
  credentials: UpdateAddressPayload
): Promise<AddressesApiResponse> {
  return apiRequest<AddressesApiResponse>(
    "put",
    `/users/${user_id}/addresses/${address_id}`,
    credentials
  );
}

export async function getAddresses(
  user_id: string | null
): Promise<AddressesApiResponse> {
  return apiRequest<AddressesApiResponse>("get", `/users/${user_id}/addresses`);
}

export async function deleteAddress(
  user_id: string,
  address_id: number
): Promise<AddressesApiResponse> {
  return apiRequest<AddressesApiResponse>(
    "delete",
    `/users/${user_id}/addresses/${address_id}`
  );
}
