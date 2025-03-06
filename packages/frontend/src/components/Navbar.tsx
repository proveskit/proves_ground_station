import { useContext, useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router";

const LINKS: { name: string; href: string }[] = [
  { name: "Logs", href: "/" },
  { name: "Commands", href: "/commands" },
  { name: "Files", href: "/files" },
  { name: "Settings", href: "/settings" },
];

export default function Navbar() {
  const [usbDevices, setUsbDevices] = useState<string[]>([]);
  const [activeDevice, setActiveDevice] = useState<string>("");

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
            {true === true ? (
              <button
                className="bg-white text-black px-3 py-2 rounded-md hover:cursor-pointer"
                onClick={() => {
                  // add connection support
                }}
              >
                Connect
              </button>
            ) : (
              <button
                className="bg-red-500 text-white px-3 py-2 rounded-md hover:cursor-pointer"
                onClick={() => {
                  // add disconnection support
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
