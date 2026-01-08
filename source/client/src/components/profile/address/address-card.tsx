"use client";

import { Address } from "@/lib/types";
import { PenBoxIcon, Trash2Icon } from "lucide-react";

type Props = {
  address: Address;
  onEdit: (data: Address) => void;
  onDelete: (data: Address) => void;
};

export default function AddressCard({ address, onEdit, onDelete }: Props) {
  return (
    <li className="bg-white p-4 border border-gray-200 rounded-xl space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-xl font-semibold">{address.recipientName}</h4>
          {address.isDefault && (
            <span className="py-1 px-2 rounded-sm bg-blue-50 text-blue-500">
              Mặc định
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(address)}
            className="p-2 text-gray-400 rounded-lg hover:text-blue-500 hover:bg-gray-100 transition cursor-pointer"
          >
            <PenBoxIcon size={20} />
          </button>
          {!address.isDefault && (
            <button
              type="button"
              onClick={() => onDelete(address)}
              className="p-2 text-gray-400 rounded-lg hover:text-red-500 hover:bg-gray-100 transition cursor-pointer"
            >
              <Trash2Icon size={20} />
            </button>
          )}
        </div>
      </div>
      <p>
        {address.street}, {address.ward}, {address.district}, {address.city}
      </p>
      <p>{address.phone}</p>
    </li>
  );
}
