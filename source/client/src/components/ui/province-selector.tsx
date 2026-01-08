"use client";

import SelectInput from "./select-input";

interface Props {
  value: string | null;
  onChange: (value: string) => void;
}

const provinces: string[] = ["Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Hải Phòng"];

export default function ProvinceSelector({ value, onChange }: Props) {
  return (
    <SelectInput
      label="Tỉnh/Thành phố"
      placeholder="Chọn tỉnh/thành"
      options={provinces}
      value={value}
      onChange={onChange}
      displayValue={(province) => province}
    />
  );
}
