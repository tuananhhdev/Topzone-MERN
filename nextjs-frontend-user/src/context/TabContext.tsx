import React, { createContext, useState } from "react";



export const TabContext = createContext();

// Component Provider và export
export const TabProvider = ({ specification, children }) => {
  const [activeTab, setActiveTab] = useState(Object.keys(specification)[0]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  return (
    <TabContext.Provider value={{ activeTab, handleTabChange, specification }}>
      {children}
    </TabContext.Provider>
  );
};
