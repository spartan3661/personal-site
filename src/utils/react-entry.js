// react-entry.js (or .tsx if using TypeScript)
import { createRoot } from "react-dom/client";
import React from "react";
import App from "./App";

const container = document.getElementById("react-root");

if (container) {
  const root = createRoot(container);
  root.render(<App />);
}
