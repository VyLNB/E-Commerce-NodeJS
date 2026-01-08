"use client";

import SelectInput from "./select-input";

interface Props {
  value: string | null;
  onChange: (value: string) => void;
}

const districts = [
  "Quận 1",
  "Quận 2",
  "Quận 3",
  "Quận 4",
  "Quận 5",
  "Quận 6",
  "Quận 7",
  "Quận 8",
  "Quận 9",
  "Quận 10",
  "Quận 11",
  "Quận 12",
];

export default function DistrictSelector({ value, onChange }: Props) {
  return (
    <SelectInput
      label="Quận/huyện"
      placeholder="Chọn quận/huyện"
      options={districts}
      value={value}
      onChange={onChange}
      displayValue={(district) => district}
    />
  );
}
