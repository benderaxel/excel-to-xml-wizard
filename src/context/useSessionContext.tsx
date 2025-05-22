import { SessionContext } from "@/hooks/useSession";
import { useState, useEffect, useCallback } from "react";

export const SessionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [sessionId, setSessionId] = useState("");

  const createNewSessionId = () => {
    return crypto.randomUUID();
  };

  const refreshSession = useCallback(() => {
    const newSessionId = createNewSessionId();
    setSessionId(newSessionId);
    localStorage.setItem("app_session_id", newSessionId);
  }, []);

  useEffect(() => {
    // Check if there's an existing session ID in localStorage
    const existingSessionId = localStorage.getItem("app_session_id");

    if (existingSessionId) {
      setSessionId(existingSessionId);
    } else {
      // Create a new session ID if none exists
      refreshSession();
    }
  }, [refreshSession]);

  const value = {
    sessionId,
    refreshSession,
  };

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
};
