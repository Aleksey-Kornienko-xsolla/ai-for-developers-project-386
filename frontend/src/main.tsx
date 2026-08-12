import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { QueryProvider } from "@/app/providers";
import { Router } from "@/app/providers/Router";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryProvider>
      <Router />
    </QueryProvider>
  </StrictMode>,
);