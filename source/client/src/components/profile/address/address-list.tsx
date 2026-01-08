import { Address } from "@/lib/types";
import React from "react";
import AddressCard from "./address-card";

type Props = {
  initialAddresses: Address[];
  handleOpenModal: (address?: Address) => void;
  handleOpenDeleteModal: (address: Address) => void;
};

const AddressList = ({
  initialAddresses,
  handleOpenModal,
  handleOpenDeleteModal,
}: Props) => {
  return (
    <ul className="w-full space-y-8">
      {initialAddresses.map((address) => (
        <AddressCard
          key={address._id}
          address={address}
          onEdit={() => handleOpenModal(address)}
          onDelete={handleOpenDeleteModal}
        />
      ))}
    </ul>
  );
};

export default AddressList;
