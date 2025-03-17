import { useContext, useEffect, useState } from "react";
import { FaSync } from "react-icons/fa";
import { NavLink, Outlet } from "react-router";
import { SatelliteContext } from "../context/SatelliteContext";
import { WebsocketContext } from "../context/WebsocketContext";

const LINKS: { name: string; href: string }[] = [
  { name: "Logs", href: "/" },
  { name: "Commands", href: "/commands" },
  { name: "Files", href: "/files" },
  { name: "Settings", href: "/settings" },
];

export default function Navbar() {
  const [usbConnected, setUsbConnected] = useState<
    { status: false; path: null } | { status: true; path: string }
  >({ status: false, path: null });

  const socket = useContext(WebsocketContext);
  const connectionCtx = useContext(SatelliteContext)!;

  useEffect(() => {
    if (socket) {
      socket.on("check-connected", (data) => {
        connectionCtx.setConnection(data);
      });

      socket.on("check-proves-connected", (result) => {
        setUsbConnected(result);
      });

      socket.emit("check-connected");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  const checkProvesConnected = () => {
    socket?.emit("check-proves-connected");
  };

  return (
    <div>
      <div className="w-full h-14 bg-blue-600 px-6 flex items-center justify-between text-white">
        <div className="flex gap-4 items-center">
          {LINKS.map((link, idx) => (
            <NavLink to={link.href} key={idx}>
              {link.name}
            </NavLink>
          ))}
        </div>
        <div>
          <div className="flex gap-3 items-center">
            <button
              className="hover:cursor-pointer"
              onClick={checkProvesConnected}
            >
              <FaSync />
            </button>
            {!usbConnected.status ? (
              <p>PROVESKit Not Connected</p>
            ) : !connectionCtx.connection.connected ? (
              <button
                className="bg-white text-black px-3 py-2 rounded-md hover:cursor-pointer"
                onClick={() => {
                  socket?.emit("connect-device");
                  connectionCtx.setConnection({
                    connected: true,
                    deviceName: usbConnected.path,
                    connectedAt: Date.now(),
                  });
                }}
              >
                Connect
              </button>
            ) : (
              <button
                className="bg-red-500 text-white px-3 py-2 rounded-md hover:cursor-pointer"
                onClick={() => {
                  socket?.emit("disconnect-device");
                  connectionCtx.setConnection({ connected: false });
                }}
              >
                Disconnect
              </button>
            )}
          </div>
        </div>
      </div>
      <Outlet />
    </div>
  );
}
