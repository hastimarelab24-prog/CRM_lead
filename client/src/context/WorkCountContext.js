import React, { createContext, useState } from "react";
export const WorkspaceContext = createContext({
  totalTeam: 0,
  setTotalTeam: () => {},
  totalLeads: 0,
  setTotalLeads: () => {},
});

export default function WorkCountContext({ children }) {
  const [totalLeads, setTotalLeads] = useState(0);
  const [totalTeam, setTotalTeam] = useState(0);

  return (
    <WorkspaceContext.Provider
      value={{
        totalLeads,
        setTotalLeads,
        totalTeam,
        setTotalTeam,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}
