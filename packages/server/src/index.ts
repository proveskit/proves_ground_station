import cors from "cors";
import express, { Express } from "express";
import { createServer } from "http";
import path from "path";
import { apiRouter } from "./api";

const app: Express = express();
app.use(cors());

const port = 3000;
export const server = createServer(app);

// This code makes sure that any request that does not matches a static file
// in the build folder, will just serve index.html. Client side routing is
// going to make sure that the correct content will be loaded.
app.use((req, res, next) => {
  if (
    /(.ico|.js|.css|.jpg|.png|.map|.svg)$/i.test(req.path) ||
    req.path.startsWith("/api")
  ) {
    next();
  } else {
    res.header("Cache-Control", "private, no-cache, no-store, must-revalidate");
    res.header("Expires", "-1");
    res.header("Pragma", "no-cache");
    res.sendFile(path.join(__dirname, "build", "index.html"));
  }
});
app.use(express.static(path.join(__dirname, "build")));

// ROUTERS
app.use("/api", apiRouter);

// Initialize socket.io server
import { initializeWs } from "./socket";
initializeWs(server);

server.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
