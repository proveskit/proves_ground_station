import { createContext } from "react";

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

export const SatelliteContext = createContext<{
  connection: ConnectionState;
  setConnection: React.Dispatch<React.SetStateAction<ConnectionState>>;
} | null>(null);
