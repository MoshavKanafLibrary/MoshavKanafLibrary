import React from "react";
import { Link } from "react-router-dom";

// NavHeaders component for displaying navigation links in the navbar.
// Supports both Link-based navigation and button actions based on the `onClick` property.
// Links are styled with hover effects and dynamically rendered based on the provided `navBarLinks` array.


const NavHeaders = ({ navBarLinks }) => {
  return (
    <div className="hidden lg:flex">
      {navBarLinks.map((link, index) => (
        link.onClick ? (
          <button
            key={index}
            onClick={link.onClick}
            className="text-bg-text hover:bg-bg-text hover:text-bg-navbar-custom px-3 py-2 rounded-md text-sm font-medium md:flex md:items-center md:px-4 md:py-3 md:text-base"
          >
            {link.name}
          </button>
        ) : (
          <Link
            key={link.path}
            to={link.path}
            className="text-bg-text hover:bg-bg-text hover:text-bg-navbar-custom px-3 py-2 rounded-md text-sm font-medium md:flex md:items-center md:px-4 md:py-3 md:text-base"
          >
            {link.name}
          </Link>
        )
      ))}
    </div>
  );
};

export default NavHeaders;
