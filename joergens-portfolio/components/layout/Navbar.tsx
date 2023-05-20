import React from "react";
import { Bars4Icon } from "@heroicons/react/24/outline";
import classNames from "classnames";
type Props = {
  onMenuButtonClick(): void;
};
const Navbar = (props: Props) => {
  return (
    <nav
      className={classNames({
        "bg-white text-zinc-500": true, // colors
        "flex items-center": true, // layout
        "w-full fixed z-10 px-4 shadow-sm h-16": true, //positioning & styling
      })}
    >
      <div className="font-bold text-lg">Jacob Joergens</div>
      <div className="flex-grow"></div>
      <button type='button' aria-label="Menu" className="md:hidden" onClick={props.onMenuButtonClick}>
        <Bars4Icon className="h-6 w-6" />
      </button>
    </nav>
  );
};

export default Navbar;
