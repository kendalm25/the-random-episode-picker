import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Show from "./routes/show.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/show/:showId" element={<Show />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
