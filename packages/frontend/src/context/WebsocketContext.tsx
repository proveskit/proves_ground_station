import { createContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export function WebsocketContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
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

export const WebsocketContext = createContext<Socket | null>(null);
