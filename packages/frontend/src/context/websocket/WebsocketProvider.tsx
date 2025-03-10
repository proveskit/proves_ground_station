import { useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";
import { WebsocketContext } from "./context";

export function WebsocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);

  const connectSocket = () => {
    setSocket(io("http://localhost:3000"));
  };

  useEffect(() => {
    if (!socket) {
      connectSocket();
    }
  }, [socket]);

  return (
    <WebsocketContext.Provider value={socket}>
      {children}
    </WebsocketContext.Provider>
  );
}
