import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

const rootEl = document.getElementById("booking-form-root");

if (rootEl) {
  createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
