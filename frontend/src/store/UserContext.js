import React, { createContext, useContext, useState } from 'react';


const UserContext = createContext(null);

//Using the context, there will be access to the details of the user connected to the site in the pages and various components.
export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};


export const useUser = () => useContext(UserContext);
