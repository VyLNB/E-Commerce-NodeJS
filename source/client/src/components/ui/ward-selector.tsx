"use client";

import SelectInput from "./select-input";

interface Props {
  value: string | null;
  onChange: (value: string) => void;
}

const wards = [
  "phường Tân Thuận Đông",
  "phường Tân Kiểng",
  "phường Tân Hưng",
  "phường Bình Thuận",
];

export default function WardSelector({ value, onChange }: Props) {
  return (
    <SelectInput
      label="Phường/xã"
      placeholder="Chọn phường/xã"
      options={wards}
      value={value}
      onChange={onChange}
      displayValue={(ward) => ward}
    />
  );
}
