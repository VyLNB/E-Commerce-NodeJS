"use client";

import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import clsx from "clsx";
import { Fragment, ReactNode } from "react";

interface DropdownItem {
  name: string;
  onClick: () => void;
  isForm?: boolean;
}

interface DropdownMenuProps {
  label: string;
  items: DropdownItem[];
  LeftIcon?: ReactNode;
  RightIcon?: ReactNode;
  btnClassNames?: string;
}

function DropdownOption({ name, onClick, isForm }: DropdownItem) {
  return (
    <MenuItem as="div" key={name}>
      {isForm ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onClick();
          }}
          method="POST"
        >
          <button
            type="submit"
            className="border-t border-gray-300 block w-full px-4 py-2 text-left text-gray-500 hover:text-gray-700 transition data-focus:bg-white/5 data-focus:text-white data-focus:outline-hidden"
          >
            {name}
          </button>
        </form>
      ) : (
        <button
          onClick={onClick}
          className="block w-full text-left px-4 py-2 text-gray-500 hover:text-gray-700 transition data-focus:bg-white/5 data-focus:text-white data-focus:outline-hidden"
        >
          {name}
        </button>
      )}
    </MenuItem>
  );
}

export default function Dropdown({
  label,
  items,
  LeftIcon,
  RightIcon,
  btnClassNames,
}: DropdownMenuProps) {
  const btnClassName = clsx(
    btnClassNames,
    "inline-flex items-center w-full outline-none justify-center gap-x-2 rounded-md px-3 py-2 text-gray-700"
  );
  return (
    <Menu as="div" className="relative inline-block text-left">
      {/* Dropdown Button */}
      <MenuButton className={btnClassName}>
        {LeftIcon}
        {label}
        {RightIcon}
      </MenuButton>

      {/* Dropdown Options */}
      <MenuItems
        transition
        className="shadow-lg absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white outline-1 -outline-offset-1 outline-black/10 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
      >
        {items.map((item, index) => (
          <Fragment key={index}>
            <DropdownOption
              name={item.name}
              onClick={item.onClick}
              isForm={item.isForm}
            />
          </Fragment>
        ))}
      </MenuItems>
    </Menu>
  );
}
