import React, { createContext, useContext, useState } from 'react';

const NavbarContext = createContext();

export const NavbarProvider = ({ children }) => {
  const [navItems, setNavItems] = useState([]);

  return (
    <NavbarContext.Provider value={{ navItems, setNavItems }}>
      {children}
    </NavbarContext.Provider>
  );
};

export const useNavbar = () => useContext(NavbarContext);
