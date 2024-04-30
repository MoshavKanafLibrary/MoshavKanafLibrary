import React from "react";

const UserContext = React.createContext({
    navBarDisplayName: "",
    setNavBarDisplayName: () => {} // Define a placeholder function
  });

export default UserContext;