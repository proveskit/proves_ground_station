import { useContext, useEffect, useState } from "react";
import { LoggingContext } from "./context";
import { WebsocketContext } from "../WebsocketContext";

export function LoggingProvider({ children }: { children: React.ReactNode }) {
  const [msgs, setMsgs] = useState<string[]>([]);
  const socket = useContext(WebsocketContext);

  useEffect(() => {
    if (socket) {
      socket.on("terminal-data", (data) => {
        if (msgs.length > 300) {
          msgs.pop();
        }

        setMsgs((prev) => [data, ...prev]);
      });
    }

    return () => {
      socket?.off("terminal-data");
    };
  }, [socket]);

  return (
    <LoggingContext.Provider value={msgs}>{children}</LoggingContext.Provider>
  );
}
