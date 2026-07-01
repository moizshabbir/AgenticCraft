import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import WorkspaceCanvasWrapper from "./components/WorkspaceCanvas";
import FriendView from "./components/FriendView";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WorkspaceCanvasWrapper />} />
        <Route path="/arcade/:id" element={<FriendView />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
