import { createContext, useState } from "react";

export type ConnectionState =
  | ConnectedConnectionState
  | DisconnectedConnectionState;

type ConnectedConnectionState = {
  connected: true;
  deviceName: string;
  connectedAt: number;
};

type DisconnectedConnectionState = {
  connected: false;
};

export function SatelliteContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [connection, setConnection] = useState<ConnectionState>({
    connected: false,
  });

  return (
    <SatelliteContext.Provider
      value={{ connection: connection, setConnection: setConnection }}
    >
      {children}
    </SatelliteContext.Provider>
  );
}

export const SatelliteContext = createContext<{
  connection: ConnectionState;
  setConnection: React.Dispatch<React.SetStateAction<ConnectionState>>;
} | null>(null);
