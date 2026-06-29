import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { SorokitProvider } from "@/context/SorokitProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import {
  initClient,
import { createClientAdapter } from "@/lib/adapter";

/**
 * Initialize sorokit-core client.
 */
const clientResult = createSorokitClient({ network: "testnet" });
if (!isOk(clientResult)) {
  throw new Error(
    `Failed to create sorokit client: ${clientResult.error.message}`,
  );
}
const coreClient = clientResult.data;

// Create an adapter that matches the expected interface
const client = createClientAdapter(coreClient);
initClient(client);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <SorokitProvider client={client}>
        <App />
      </SorokitProvider>
    </ErrorBoundary>
  </StrictMode>,
);
