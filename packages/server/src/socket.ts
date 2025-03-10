import { exec } from "child_process";
import { Server as HttpServer } from "http";
import { ReadlineParser, SerialPort } from "serialport";
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
  }

  registerListeners(socket: Socket) {
    this.parser!.on("data", (data) => {
      socket.emit("terminal-data", data);
    });

    // add event listeners to listener array
    this.listeners.push("send-command");
    this.listeners.push("enter-repl");
    this.listeners.push("exit-repl");
    this.listeners.push("check-connected");

    // register listeners
    socket.on("send-command", (msg) => this.sendMessage(msg));
    socket.on("enter-repl", () => this.enterRepl());
    socket.on("exit-repl", () => this.exitRepl());
    socket.on("check-connected", () => {
      this.checkConnected(socket);
    });
  }

  connect(socket: Socket, device: string) {
    if (this.conn) return;

    this.conn = new SerialPort({
      path: device,
      baudRate: 9600,
      dataBits: 8,
      parity: "none",
      stopBits: 1,
    });

    this.parser = this.conn.pipe(new ReadlineParser({ delimiter: "\r\n" }));

    this.connected = {
      connected: true,
      deviceName: device,
      connectedAt: Date.now(),
    };

    this.registerListeners(socket);
  }

  disconnect(socket: Socket) {
    if (!this.conn) return;

    this.conn?.close();
    this.conn = null;
    this.parser = null;
    this.connected = { connected: false };

    for (const l of this.listeners) {
      socket.removeAllListeners(l);
    }

    this.listeners = [];
  }

  checkConnected(socket: Socket) {
    console.log("???????????????/");
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
    socket.on("usb-devices", () => {
      exec("ls /dev/tty.usbmodem*", (error, stdout) => {
        if (error) {
          socket.emit("usb-devices", []);
          return;
        }
        socket.emit(
          "usb-devices",
          stdout.split("\n").filter((d) => d !== ""),
        );
      });
    });

    socket.on("connect-device", (device) => {
      manager.connect(socket, device);
    });

    socket.on("disconnect-device", () => {
      manager.disconnect(socket);
    });

    socket.on("check-connected", () => {
      socket.emit("check-connected", manager.connected);
    });
  });
}
