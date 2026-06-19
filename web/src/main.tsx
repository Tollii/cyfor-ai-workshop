import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import { setApiClientBaseUrl } from "./api";

import App from "./App";
import DemoPage from "./DemoPage";
import "./index.css";

setApiClientBaseUrl(import.meta.env.VITE_API_BASE_URL ?? "/api");

const queryClient = new QueryClient();

const isDemoRoute = window.location.pathname.replace(/\/+$/, "") === "/demo";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      {isDemoRoute ? <DemoPage /> : <App />}
    </QueryClientProvider>
  </React.StrictMode>,
);
