import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router";
import Home from "./routes/Home";
import Navbar from "./components/Navbar";
import Commands from "./routes/Commands";
import Settings from "./routes/Settings";
import Files from "./routes/Files";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <main className="min-w-screen min-h-screen">
        <Routes>
          <Route element={<Navbar />}>
            <Route index path="/" element={<Home />} />
            <Route path="/commands" element={<Commands />} />
            <Route path="/files" element={<Files />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </main>
    </BrowserRouter>
  </StrictMode>,
);
