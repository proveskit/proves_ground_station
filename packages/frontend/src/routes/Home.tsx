import { useContext, useEffect, useState } from "react";
import { FaBug, FaCheck, FaInfoCircle } from "react-icons/fa";
import { IoWarning } from "react-icons/io5";
import { MdError, MdErrorOutline } from "react-icons/md";
import { z } from "zod";
import { WebsocketContext } from "../context/WebsocketContext";

export default function Home() {
  const [msgs, setMsgs] = useState<string[]>([]);
  const [cmdInput, setCmdInput] = useState("");
  const socket = useContext(WebsocketContext);

  useEffect(() => {
    if (socket) {
      socket.on("terminal-data", (data) => {
        setMsgs((prev) => [data, ...prev]);
      });
    }
  }, [socket]);

  return (
    <div className="w-screen p-4">
      <div className="flex items-center">
        <p className="font-bold text-2xl mb-3">Logging</p>
      </div>
      <div className="w-full gap-3 h-200 overflow-scroll bg-neutral-100 flex flex-col-reverse rounded-md shadow-sm p-2">
        {msgs.map((msg, idx) => {
          try {
            const validatedLog = LogSchema.parse(JSON.parse(msg));
            return <FormattedLog log={validatedLog} key={idx} />;
          } catch (e) {
            return <p>{msg}</p>;
          }
        })}
      </div>
      <div className="flex h-12 items-center gap-2">
        <input
          type="text"
          value={cmdInput}
          onChange={(evt) => setCmdInput(evt.target.value)}
          className="border-2 h-10 rounded-md border-neutral-600"
        />
        <button
          className="bg-green-600 text-white px-3 py-2 rounded-md hover:cursor-pointer"
          onClick={() => {
            console.log(cmdInput);
            socket?.emit("send-command", cmdInput);
            setCmdInput("");
          }}
        >
          Send Command
        </button>
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

const omit = (obj, arr) =>
  Object.fromEntries(Object.entries(obj).filter(([k]) => !arr.includes(k)));

const LOG_ICONS: { [key: string]: any } = {
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
  return (
    <div
      className={`w-full min-h-14 ${BG_COLORS[log.level]} justify-between rounded-md shadow-md flex gap-2 items-center px-4`}
    >
      <div className="flex items-center gap-2">
        <LogIcon size={24} />
        <p>{log.msg}</p>
        <div className="bg-neutral-400">
          {Object.entries(omit(log, ["msg", "time", "level"])).map(([k, v]) => (
            <p key={k}>{`${k}: ${v}`}</p>
          ))}
        </div>
      </div>
      <p className="text-neutral-600 text-sm">{log.time}</p>
    </div>
  );
}
