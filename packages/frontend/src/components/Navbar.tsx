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
  const [usbDevices, setUsbDevices] = useState<string[]>([]);
  const [activeDevice, setActiveDevice] = useState<string>("");

  const socket = useContext(WebsocketContext);
  const connectionCtx = useContext(SatelliteContext)!;

  useEffect(() => {
    if (socket) {
      socket.on("usb-devices", (data) => {
        setUsbDevices(data);
        setActiveDevice(data[0]);
      });

      socket.on("check-connected", (data) => {
        connectionCtx.setConnection(data);
      });

      socket.emit("check-connected");
      socket.emit("usb-devices");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  const refreshDevices = () => {
    socket?.emit("usb-devices");
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
            <button onClick={refreshDevices} className="hover:cursor-pointer">
              <FaSync />
            </button>
            {usbDevices.length > 0 ? (
              <select
                value={activeDevice}
                className="border-2 h-8 rounded-sm border-neutral-400"
              >
                {usbDevices.map((device, idx) => (
                  <option onClick={() => setActiveDevice(device)} key={idx}>
                    {device}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-white">No devices found!</p>
            )}
            {usbDevices.length > 0 &&
              (!connectionCtx.connection.connected ? (
                <button
                  className="bg-white text-black px-3 py-2 rounded-md hover:cursor-pointer"
                  onClick={() => {
                    socket?.emit("connect-device", activeDevice);
                    connectionCtx.setConnection({
                      connected: true,
                      deviceName: activeDevice,
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
              ))}
          </div>
        </div>
      </div>
      <Outlet />
    </div>
  );
}
