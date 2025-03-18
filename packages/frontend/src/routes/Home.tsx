import { useContext, useState } from "react";
import { FaBug, FaCheck, FaInfoCircle } from "react-icons/fa";
import { IoChevronDownOutline, IoWarning } from "react-icons/io5";
import { IconType } from "react-icons/lib";
import { MdError, MdErrorOutline } from "react-icons/md";
import { z } from "zod";
import { LoggingContext } from "../context/LoggingContext";
import { WebsocketContext } from "../context/WebsocketContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export default function Home() {
  const [cmdInput, setCmdInput] = useState("");

  const msgs = useContext(LoggingContext);
  const socket = useContext(WebsocketContext);

  return (
    <div className="w-screen h-screen flex flex-col p-4">
      <div className="flex items-center">
        <p className="font-bold text-2xl mb-3">Logging</p>
      </div>
      <div className="w-full gap-3 flex-grow overflow-scroll bg-neutral-100 flex flex-col-reverse rounded-md shadow-sm p-2">
        {msgs.map((msg, idx) => {
          try {
            const validatedLog = LogSchema.parse(JSON.parse(msg));
            return <FormattedLog log={validatedLog} key={idx} />;
          } catch {
            return <p>{msg}</p>;
          }
        })}
      </div>
      <div className="flex h-12 items-center gap-2 pt-3">
        <form
          action={() => {
            socket?.emit("send-command", cmdInput);
            setCmdInput("");
          }}
        >
          <input
            type="text"
            value={cmdInput}
            onChange={(evt) => setCmdInput(evt.target.value)}
            className="border-2 h-10 rounded-md border-neutral-600"
          />
          <button
            className="bg-green-600 text-white px-3 py-2 rounded-md hover:cursor-pointer"
            type="submit"
          >
            Send Command
          </button>
        </form>
        <button
          className="bg-green-600 text-white px-3 py-2 rounded-md hover:cursor-pointer"
          onClick={() => {
            socket?.emit("enter-repl");
          }}
        >
          Enter REPL
        </button>
        <button
          className="bg-red-600 text-white px-3 py-2 rounded-md hover:cursor-pointer"
          onClick={() => {
            socket?.emit("exit-repl");
          }}
        >
          Exit REPL
        </button>
      </div>
    </div>
  );
}

const LogSchema = z
  .object({
    msg: z.string(),
    time: z.string(),
    level: z.enum(["NOTSET", "DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"]),
  })
  .catchall(z.any());

type Log = z.infer<typeof LogSchema>;

const omit = (obj: object, arr: unknown[]) =>
  Object.fromEntries(Object.entries(obj).filter(([k]) => !arr.includes(k)));

const LOG_ICONS: { [key: string]: IconType } = {
  NOTSET: FaCheck,
  DEBUG: FaBug,
  INFO: FaInfoCircle,
  WARNING: IoWarning,
  ERROR: MdErrorOutline,
  CRITICAL: MdError,
};

const BG_COLORS: { [key: string]: string } = {
  NOTSET: "bg-neutral-200",
  INFO: "bg-neutral-200",
  DEBUG: "bg-blue-200",
  WARNING: "bg-yellow-200",
  ERROR: "bg-red-300",
  CRITICAL: "bg-red-500",
};

function FormattedLog({ log }: { log: Log }) {
  const LogIcon = LOG_ICONS[log.level];
  const extraParams = omit(log, ["msg", "time", "level"]);

  return (
    <div
      className={`w-full min-h-14 ${BG_COLORS[log.level]} justify-between rounded-md shadow-md flex gap-2 items-center px-4`}
    >
      <div className="flex items-center gap-2">
        <LogIcon size={24} />
        <p>{log.msg}</p>
        {Object.entries(extraParams).length > 0 && (
          <Popover>
            <PopoverTrigger className="flex items-center gap-1 hover:cursor-pointer bg-neutral-300 py-1.5 px-2 rounded-sm">
              <IoChevronDownOutline size={12} />
              <p className="text-sm">Show Extra Data</p>
            </PopoverTrigger>
            <PopoverContent>
              <div className="flex items-center gap-2 flex-col h-75 overflow-scroll">
                {Object.entries(extraParams).map(([k, v]) => (
                  <div className="bg-neutral-200 p-1 rounded-md w-full">
                    <p className="font-bold">{k}</p>
                    <p>{v}</p>
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
      <p className="text-neutral-600 text-sm">{log.time}</p>
    </div>
  );
}
