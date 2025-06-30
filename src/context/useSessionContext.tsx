import { SessionContext } from "@/hooks/useSession";
import { useState } from "react";

export const SessionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [sessionId] = useState(() => crypto.randomUUID());

  const value = {
    sessionId,
  };

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
};
