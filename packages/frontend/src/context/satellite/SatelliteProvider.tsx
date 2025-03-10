import { useState } from "react";
import { ConnectionState, SatelliteContext } from "./context";

export function SatelliteProvider({ children }: { children: React.ReactNode }) {
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
