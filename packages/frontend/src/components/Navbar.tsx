import { useContext, useEffect } from "react";
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
  const socket = useContext(WebsocketContext);
  const connectionCtx = useContext(SatelliteContext)!;

  useEffect(() => {
    if (socket) {
      socket.on("check-proves-connected", (data) => {
        connectionCtx.setConnection(data);
      });

      socket.on("usb-connected", (data) => {
        socket.emit("register-event-listeners");
        connectionCtx.setConnection(data);
      });

      socket.on("usb-disconnected", () => {
        connectionCtx.setConnection({ connected: false });
      });

      socket.emit("check-proves-connected");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

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
            {connectionCtx.connection.connected ? (
              <p>PROVESKit Connected</p>
            ) : (
              <p>Plug in PROVESKit to connect</p>
            )}
          </div>
        </div>
      </div>
      <Outlet />
    </div>
  );
}
