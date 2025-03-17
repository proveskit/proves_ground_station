import { Server as HttpServer } from "http";
import { ReadlineParser, SerialPort } from "serialport";
import { autoDetect } from "@serialport/bindings-cpp";
import { Server, Socket } from "socket.io";

type ConnectionState = ConnectedConnectionState | DisconnectedConnectionState;

type ConnectedConnectionState = {
  connected: true;
  deviceName: string;
  connectedAt: number;
};

type DisconnectedConnectionState = {
  connected: false;
};

class SerialManager {
  conn: SerialPort | null;
  parser: ReadlineParser | null;
  connected: ConnectionState;
  listeners: string[];

  constructor() {
    this.conn = null;
    this.parser = null;
    this.connected = { connected: false };
    this.listeners = [];

    // begin looping until the usb is connected
    loopUntilUsbConnected();
  }

  registerListeners(socket: Socket) {
    this.parser!.on("data", (data) => {
      socket.emit("terminal-data", data);
    });

    // add event listeners to listener array
    this.listeners.push("send-command");
    this.listeners.push("enter-repl");
    this.listeners.push("exit-repl");

    // register listeners
    socket.on("send-command", (msg) => this.sendMessage(msg));
    socket.on("enter-repl", () => this.enterRepl());
    socket.on("exit-repl", () => this.exitRepl());
  }

  async connect() {
    if (this.conn) return;

    const device = await checkProvesConnected();
    if (!device.status) return;

    this.conn = new SerialPort({
      path: device.path,
      baudRate: 9600,
      dataBits: 8,
      parity: "none",
      stopBits: 1,
    });

    this.parser = this.conn.pipe(new ReadlineParser({ delimiter: "\r\n" }));

    this.conn.on("close", () => {
      console.log("USB disconnected");
      io.emit("usb-disconnected");
      this.disconnect();
    });

    this.connected = {
      connected: true,
      deviceName: device.path,
      connectedAt: Date.now(),
    };

    io.emit("usb-connected", this.connected);
  }

  disconnect() {
    if (!this.conn) return;

    this.conn = null;
    this.parser = null;
    this.connected = { connected: false };

    for (const l of this.listeners) {
      io.removeAllListeners(l);
    }

    this.listeners = [];

    // begin looping until the usb is connected again
    loopUntilUsbConnected();
  }

  checkConnected(socket: Socket) {
    socket.emit("check-connected", this.connected);
  }

  sendMessage(message: string) {
    if (!this.conn) return;

    this.conn.write(`${message}\r\n`);
  }

  enterRepl() {
    if (!this.conn) return;

    this.conn.write(Buffer.from([0x03]));
    this.conn.write("a\r\n");
  }

  exitRepl() {
    if (!this.conn) return;

    this.conn.write(Buffer.from([0x04]));
    this.conn.write("a\r\n");
  }
}

let io: Server;
const manager = new SerialManager();

export function initializeWs(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
    },
  });

  io.on("connection", (socket) => {
    console.log("New Connection: ", socket.id);

    if (manager.connected.connected === true) {
      manager.registerListeners(socket);
    }

    // Websocket Events
    socket.on("register-event-listeners", () => {
      manager.registerListeners(socket);
    });

    socket.on("check-proves-connected", async () => {
      socket.emit("check-proves-connected", manager.connected);
    });
  });
}

const PROVESKIT_PIDS = {
  OLD_V4: "0011",
  V4: "e004",
};

// Find a valid PROVESKit serial port
async function findDevicePort() {
  const bindings = autoDetect();

  try {
    const ports = await bindings.list();
    const device = ports.find((port) => {
      // Check for a valid productId
      return (
        port.vendorId === "1209" &&
        Object.values(PROVESKIT_PIDS).includes(port.productId ?? "")
      );
    });

    if (device) {
      return device.path;
    } else {
      return null;
    }
  } catch (e) {
    console.error("Failed to search for ports: ", e);
    return null;
  }
}

async function checkProvesConnected(): Promise<
  | {
      status: false;
      path: null;
    }
  | { status: true; path: string }
> {
  const result = await findDevicePort();
  if (result) {
    return { status: true, path: result };
  } else {
    return { status: false, path: null };
  }
}

async function loopUntilUsbConnected() {
  while (true) {
    console.log("Attempting to connect to PROVESKit...");
    try {
      const result = await checkProvesConnected();
      if (result.status) {
        console.log("USB connected");
        manager.connect();
        break;
      }

      await new Promise((res) => setTimeout(res, 1000));
    } catch (e) {
      console.error("Failed to check for USB devices: ", e);
      await new Promise((res) => setTimeout(res, 1000));
    }
  }
}
