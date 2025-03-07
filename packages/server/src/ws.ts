import { Server } from "socket.io";
import { server } from ".";

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

io.on("connection", (socket) => {
  console.log("Something happened");
  socket.on("message", (data) => {
    console.log(data);
    socket.send(data);
  });
});
