"use client";

import { useAppSelector } from "@/lib/hooks";
import { Address } from "@/lib/types";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import dynamic from "next/dynamic";
import AddressList from "./address-list";

const AddressDialog = dynamic(() =>
  import("@/components/dialogs").then((mod) => mod.AddressDialog)
);
const DeleteConfirmationDialog = dynamic(() =>
  import("@/components/dialogs").then((mod) => mod.DeleteConfirmationDialog)
);

type Props = {
  initialAddresses: Address[];
};

export default function AddressClientPage({ initialAddresses }: Props) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | undefined>(
    undefined
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingAddress, setDeletingAddress] = useState<Address | null>(null);

  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);

  const { _id: userId } = useAppSelector((state) => state.user);

  const handleOpenModal = (address?: Address) => {
    setEditingAddress(address);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAddress(undefined);
  };
  const handleOpenDeleteModal = (address: Address) => {
    setDeletingAddress(address);
    setIsDeleteModalOpen(true);
  };
  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setDeletingAddress(null);
  };

  const handleDeleteSuccess = (remainingAddresses: Address[]) => {
    setAddresses(remainingAddresses);
  };
  const handleSaveSuccess = (updatedAddressList: Address[]) => {
    setAddresses(updatedAddressList);
  };

  return (
    <section className="space-y-8">
      <h1 className="text-3xl font-semibold">Danh sách địa chỉ</h1>

      <button
        type="button"
        onClick={() => handleOpenModal()}
        className="flex py-4 w-full items-center justify-center gap-2 rounded-xl bg-white border border-dashed border-gray-300 hover:bg-gray-50 cursor-pointer transition"
      >
        <PlusIcon size={20} />
        Thêm địa chỉ mới
      </button>

      {/* Addresses list */}
      <AddressList
        initialAddresses={addresses}
        handleOpenModal={handleOpenModal}
        handleOpenDeleteModal={handleOpenDeleteModal}
      />

      {/* Dialogs */}
      <AddressDialog
        onSaveSuccess={handleSaveSuccess}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        initialData={editingAddress}
      />
      <DeleteConfirmationDialog
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        userId={userId}
        addressToDelete={deletingAddress}
        onDeleteSuccess={handleDeleteSuccess}
      />
    </section>
  );
}
