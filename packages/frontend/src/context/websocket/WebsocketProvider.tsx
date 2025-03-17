import { useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";
import { WebsocketContext } from "./context";

export function WebsocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!socket) {
      setSocket(io("http://localhost:3000"));
    }

    return () => {
      socket?.disconnect();
    };
  }, [socket]);

  return (
    <WebsocketContext.Provider value={socket}>
      {children}
    </WebsocketContext.Provider>
  );
}
