import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import ReactDOM from "react-dom/client";
import { setApiClientBaseUrl } from "./api";

import App from "./App";
import "./index.css";

setApiClientBaseUrl(import.meta.env.VITE_API_BASE_URL ?? "/api");

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);
