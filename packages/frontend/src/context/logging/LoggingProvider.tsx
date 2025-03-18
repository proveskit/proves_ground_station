import { useContext, useEffect, useState } from "react";
import { LoggingContext } from "./context";
import { WebsocketContext } from "../WebsocketContext";

export function LoggingProvider({ children }: { children: React.ReactNode }) {
  const [msgs, setMsgs] = useState<string[]>([]);
  const socket = useContext(WebsocketContext);

  const addMsg = (msg: string) => {
    setMsgs((prevMsgs) => {
      const newMsgs = [msg, ...prevMsgs];

      if (newMsgs.length > 300) {
        return newMsgs.slice(0, 300);
      }

      return newMsgs;
    });
  };

  useEffect(() => {
    if (socket) {
      socket.on("terminal-data", (data) => {
        addMsg(data);
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
