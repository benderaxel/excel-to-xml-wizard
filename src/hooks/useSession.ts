import { createContext, useContext } from "react";

interface SessionContextType {
  sessionId: string;
  refreshSession: () => void;
}

export const SessionContext = createContext<SessionContextType | undefined>(
  undefined
);

export const useSession = (): SessionContextType => {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};
