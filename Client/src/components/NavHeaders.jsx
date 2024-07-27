import React from "react";
import { Link } from "react-router-dom";

const NavHeaders = ({ navBarLinks }) => {
  return (
    <div className="hidden lg:flex">
      {navBarLinks.map((link, index) => (
        link.onClick ? (
          <button
            key={index}
            onClick={link.onClick}
            className="text-[#7C382A] hover:bg-[#7C382A] hover:text-[#F1E0DC] px-3 py-2 rounded-md text-sm font-medium md:flex md:items-center md:px-4 md:py-3 md:text-base"
          >
            {link.name}
          </button>
        ) : (
          <Link
            key={link.path}
            to={link.path}
            className="text-[#7C382A] hover:bg-[#7C382A] hover:text-[#F1E0DC] px-3 py-2 rounded-md text-sm font-medium md:flex md:items-center md:px-4 md:py-3 md:text-base"
          >
            {link.name}
          </Link>
        )
      ))}
    </div>
  );
};

export default NavHeaders;
