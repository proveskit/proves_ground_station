import { useContext, useState } from "react";
import { FaBug, FaCheck, FaInfoCircle } from "react-icons/fa";
import { IoChevronDownOutline, IoWarning } from "react-icons/io5";
import { RxDownload } from "react-icons/rx";
import { IconType } from "react-icons/lib";
import { MdError, MdErrorOutline, MdOutlineContentCopy } from "react-icons/md";
import { z } from "zod";
import { LoggingContext } from "../context/LoggingContext";
import { WebsocketContext } from "../context/WebsocketContext";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";

export default function Home() {
  const [cmdInput, setCmdInput] = useState("");
  const [rawDisplay, setRawDisplay] = useState(false);
  const [filterState, setFilterState] = useState<{ [key: string]: boolean }>({
    NOTSET: true,
    DEBUG: true,
    INFO: true,
    WARNING: true,
    ERROR: true,
    CRITICAL: true,
  });

  const msgs = useContext(LoggingContext);
  const socket = useContext(WebsocketContext);

  return (
    <div className="w-screen h-screen flex flex-col p-4">
      <div className="flex justify-between items-center">
        <p className="font-bold text-2xl mb-3">Logging</p>
        <div className="flex items-center gap-3">
          <Switch
            className="hover:cursor-pointer"
            checked={rawDisplay}
            onCheckedChange={setRawDisplay}
          />
          <p>Show Raw Logs</p>
          <Popover>
            <PopoverTrigger className="bg-blue-600 rounded-md px-3 py-1.5 text-white hover:cursor-pointer flex items-center gap-2">
              Filters
              <IoChevronDownOutline />
            </PopoverTrigger>
            <PopoverContent className="flex flex-col gap-3 w-42 mr-4">
              {Object.keys(filterState).map((k, idx) => (
                <div className="flex items-center gap-2" key={idx}>
                  <Checkbox
                    checked={filterState[k]}
                    onCheckedChange={(c) =>
                      setFilterState((oldState) => ({
                        ...oldState,
                        [k]: c as boolean,
                      }))
                    }
                  />
                  <p>{k}</p>
                </div>
              ))}
            </PopoverContent>
          </Popover>
          <Popover>
            <PopoverTrigger className="bg-blue-600 rounded-md px-3 py-1.5 text-white hover:cursor-pointer flex items-center gap-2">
              <p>Export Logs</p>
              <IoChevronDownOutline />
            </PopoverTrigger>
            <PopoverContent className="flex p-0 flex-col items-center w-64 mr-4">
              <button
                className="rounded-md w-full h-10 px-4 flex items-center gap-3 hover:bg-neutral-200 transition-colors hover:cursor-pointer"
                onClick={() => copyLogsToClipboard(msgs)}
              >
                <MdOutlineContentCopy />
                Copy Logs to Clipboard
              </button>
              <button
                className="rounded-md w-full h-10 px-4 flex items-center gap-3 hover:bg-neutral-200 transition-colors hover:cursor-pointer"
                onClick={() => downloadLogs(msgs)}
              >
                <RxDownload />
                Download Logs
              </button>
            </PopoverContent>
          </Popover>
        </div>
      </div>
      <div className="w-full gap-3 flex-grow overflow-scroll bg-neutral-100 flex flex-col-reverse rounded-md shadow-sm p-2 mt-2">
        {msgs.map((msg, idx) => {
          try {
            const validatedLog = LogSchema.parse(JSON.parse(msg));
            if (!filterState[validatedLog.level]) {
              return;
            }

            if (rawDisplay) {
              return (
                <p key={idx} className="font-mono">
                  {msg}
                </p>
              );
            }

            return <FormattedLog log={validatedLog} key={idx} />;
          } catch {
            return (
              <p key={idx} className="font-mono">
                {msg}
              </p>
            );
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

function copyLogsToClipboard(msgs: string[]) {
  let result = "";
  msgs.map((m) => {
    result += `${m}\n`;
  });

  window.navigator.clipboard.writeText(result);
}

function downloadLogs(msgs: string[]) {
  let result = "";
  msgs.map((m) => {
    result += `${m},\n`;
  });
  result = "[\n" + result + "]";

  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([result], { type: "text/plain" }));
  a.download = "logs.json";
  a.click();
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
