// UserContext.js
import React, { createContext, useContext, useState } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);

  return (
    <UserContext.Provider value={{ account, setAccount, contract, setContract }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
