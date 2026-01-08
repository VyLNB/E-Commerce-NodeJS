"use client";
import { getAddresses } from "@/api/address";
import { useAppSelector } from "@/lib/hooks";
import { Address } from "@/lib/types";
import { Spinner } from "@/public/icons";
import { Radio, RadioGroup } from "@headlessui/react";
import clsx from "clsx";
import { CheckCircle2, Pen, PlusCircle, Trash2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import GuestAddressForm from "./guest-checkout-form";

const AddressDialog = dynamic(() =>
  import("@/components/dialogs").then((mod) => mod.AddressDialog)
);
const DeleteConfirmationDialog = dynamic(() =>
  import("@/components/dialogs").then((mod) => mod.DeleteConfirmationDialog)
);

interface Props {
  onSelectAddress: (address: Address) => void;
}

export interface ShippingAddress extends Address {
  email?: string;
}

export default function AddressStep({ onSelectAddress }: Props) {
  const { _id: userId, isAuthenticated } = useAppSelector(
    (state) => state.user
  );

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | undefined>(
    undefined
  );
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingAddress, setDeletingAddress] = useState<Address | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchAddresses = async () => {
      if (!userId) {
        if (isMounted) setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const response = await getAddresses(userId);
        if (isMounted) {
          const fetchedAddresses = response.data || [];
          setAddresses(fetchedAddresses);

          const defaultAddr =
            fetchedAddresses.find((a) => a.isDefault) ||
            fetchedAddresses[0] ||
            null;

          setSelectedAddress(defaultAddr);
          if (defaultAddr) onSelectAddress(defaultAddr);
        }
      } catch (error) {
        console.error("Failed to fetch addresses:", error);
        if (isMounted) toast.error("Không thể tải danh sách địa chỉ.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchAddresses();

    return () => {
      isMounted = false;
    };
  }, [userId, onSelectAddress]);

  // Handlers
  const handleRadioChange = (newAddress: Address) => {
    setSelectedAddress(newAddress);
    onSelectAddress(newAddress);
  };

  const handleOpenAddEditModal = (address?: Address) => {
    setEditingAddress(address);
    setIsAddEditModalOpen(true);
  };
  const handleCloseAddEditModal = () => {
    setIsAddEditModalOpen(false);
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

  const handleSaveSuccess = (updatedAddressList: Address[]) => {
    setAddresses(updatedAddressList);
    const newDefault =
      updatedAddressList.find((a) => a.isDefault) ||
      updatedAddressList.find((a) => a._id === editingAddress?._id) ||
      updatedAddressList[0] ||
      null;
    setSelectedAddress(newDefault);
    if (newDefault) onSelectAddress(newDefault);
  };

  const handleDeleteSuccess = (remainingAddresses: Address[]) => {
    setAddresses(remainingAddresses);
    const stillSelected = remainingAddresses.find(
      (a) => a._id === selectedAddress?._id
    );
    if (!stillSelected) {
      const newDefault =
        remainingAddresses.find((a) => a.isDefault) ||
        remainingAddresses[0] ||
        null;
      setSelectedAddress(newDefault);
      if (newDefault) onSelectAddress(newDefault);
    } else {
      setSelectedAddress(stillSelected);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <Spinner size={32} />{" "}
        <p className="mt-2 text-gray-500">Đang tải địa chỉ...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
          <p className="text-blue-800 text-sm">
            Bạn đang thanh toán với tư cách <strong>Khách</strong>. Tài khoản sẽ
            được tự động tạo và gửi qua email cho bạn sau khi đặt hàng.
          </p>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Thông tin giao hàng
        </h2>
        {/* Component Form nhập địa chỉ cho khách */}
        <GuestAddressForm onConfirm={onSelectAddress} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Select Address</h2>
      <RadioGroup value={selectedAddress} onChange={handleRadioChange}>
        <div className="space-y-4">
          {addresses.map((address) => (
            <Radio
              key={address._id}
              value={address}
              className={({ checked }) =>
                clsx(
                  "relative block cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none transition",
                  checked
                    ? "border-blue-600 ring-2 ring-blue-600"
                    : "border-gray-300"
                )
              }
            >
              {({ checked }) => (
                <>
                  <div className="flex justify-between">
                    <div className="flex items-center gap-4">
                      <h3 className="font-semibold text-gray-900">
                        {address.recipientName}
                      </h3>
                      {address.isDefault && (
                        <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                          Mặc định
                        </span>
                      )}
                      {checked && (
                        <CheckCircle2
                          size={16}
                          className="text-blue-600 absolute top-4 right-4"
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Pen
                        size={16}
                        className="text-gray-400 hover:text-gray-700 cursor-pointer"
                        onClick={() => handleOpenAddEditModal(address)}
                      />
                      {!address.isDefault && (
                        <Trash2
                          size={16}
                          className="text-gray-400 hover:text-red-500 cursor-pointer"
                          onClick={() => handleOpenDeleteModal(address)}
                        />
                      )}
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    {address.street}, {address.ward}, {address.district},{" "}
                    {address.city}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    SĐT: {address.phone}
                  </p>
                </>
              )}
            </Radio>
          ))}
        </div>
      </RadioGroup>
      <button
        type="button"
        onClick={() => handleOpenAddEditModal()}
        className="cursor-pointer hover:bg-slate-50 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 p-4 text-gray-600 hover:border-gray-400 hover:text-gray-800 transition"
      >
        <PlusCircle size={20} />
        <span>Add New Address</span>
      </button>
      <AddressDialog
        onSaveSuccess={handleSaveSuccess}
        isOpen={isAddEditModalOpen}
        onClose={handleCloseAddEditModal}
        initialData={editingAddress}
      />
      <DeleteConfirmationDialog
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        userId={userId}
        addressToDelete={deletingAddress}
        onDeleteSuccess={handleDeleteSuccess}
      />
    </div>
  );
}
