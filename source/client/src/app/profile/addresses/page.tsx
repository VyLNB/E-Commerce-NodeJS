import { AddressClientPage } from "@/components/profile/address";
import { getAddressesOnServer } from "@/lib/server-api/address";

export default async function AddressesPage() {
  const initialAddresses = await getAddressesOnServer();
  return <AddressClientPage initialAddresses={initialAddresses} />;
}
