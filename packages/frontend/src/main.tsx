import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router";
import Home from "./routes/Home";
import Navbar from "./components/Navbar";
import Commands from "./routes/Commands";
import Settings from "./routes/Settings";
import Files from "./routes/Files";
import { WebsocketContextProvider } from "./context/WebsocketContext";
import { SatelliteContextProvider } from "./context/SatelliteContext";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <main className="min-w-screen min-h-screen">
        <WebsocketContextProvider>
          <SatelliteContextProvider>
            <Routes>
              <Route element={<Navbar />}>
                <Route index path="/" element={<Home />} />
                <Route path="/commands" element={<Commands />} />
                <Route path="/files" element={<Files />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Routes>
          </SatelliteContextProvider>
        </WebsocketContextProvider>
      </main>
    </BrowserRouter>
  </StrictMode>,
);
