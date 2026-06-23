import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { SorokitProvider } from "@/context/SorokitProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import {
  initClient,
  type InvokeParams,
  type SorokitClient as LocalSorokitClient,
  type NetworkInfo,
  type NetworkName,
} from "@/lib/client";
import {
  createSorokitClient,
  isOk,
  type SorokitClient as CoreSorokitClient,
} from "sorokit-core";

/**
 * Create an adapter that wraps the sorokit-core client to match the expected interface.
 */
function createClientAdapter(
  coreClient: CoreSorokitClient,
): LocalSorokitClient {
  return {
    wallet: {
      connect: async () => {
        // Mock wallet connection for demo purposes
        // In a real app, this would use a wallet adapter (Freighter, xBull, etc.)
        const mockAddress =
          "GBAMQXTQ7IQKPZXJKZJQZJQZJQZJQZJQZJQZJQZJQZJQZJQZJQZJQ";
        return {
          data: { address: mockAddress },
          error: null,
          status: "success" as const,
        };
      },
      disconnect: async () => {
        // Mock disconnection
      },
      getAddress: async () => {
        // Return mock address for demo
        const mockAddress =
          "GBAMQXTQ7IQKPZXJKZJQZJQZJQZJQZJQZJQZJQZJQZJQZJQZJQZJQ";
        return { data: mockAddress, error: null };
      },
    },
    account: {
      getAccount: async (address: string) => {
        // Mock account data
        const mockAccount = {
          address,
          sequence: "174792435",
          subentryCount: 3,
        };
        return {
          data: mockAccount,
          error: null,
          status: "success",
        };
      },
      getBalances: async () => {
        // Mock balances
        const mockBalances = [
          {
            asset: "XLM",
            balance: "1042.5000000",
            assetType: "native" as const,
          },
          {
            asset: "USDC",
            balance: "250.0000000",
            assetType: "credit_alphanum4" as const,
            assetCode: "USDC",
            assetIssuer:
              "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
          },
          {
            asset: "yXLM",
            balance: "88.1234567",
            assetType: "credit_alphanum4" as const,
            assetCode: "yXLM",
            assetIssuer:
              "GARDNV3Q7YGT4AKSDF25LT32YSCCW4EV22Y2TV3I2PU2MMXJTEDL5T55",
          },
        ];
        return { data: mockBalances, error: null };
      },
      getClaimableBalances: async (address: string) => {
        // Mock claimable balances
        const mockClaimable = [
          {
            id: "000000001a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d",
            asset: "XLM",
            amount: "25.0000000",
            sponsor: "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGZWM9CQJUQE3QLQZJQ",
            claimants: [{ destination: address, predicate: null }],
          },
        ];
        return { data: mockClaimable, error: null };
      },
      claimBalance: async () => {
        // Mock claim balance
        const mockTxResult = {
          hash: "a1b2c3d4e5f678901234567890123456789012345678901234567890123456",
          ledger: 48291036,
          successful: true,
        };
        return { data: mockTxResult, error: null };
      },
    },
    transaction: {
      submit: async () => {
        // Mock transaction submission
        const mockTxResult = {
          hash: "a1b2c3d4e5f678901234567890123456789012345678901234567890123456",
          ledger: 48291034,
          successful: true,
        };
        return {
          data: mockTxResult,
          error: null,
          status: "success",
        };
      },
      getStatus: async () => {
        // Mock transaction status
        return { data: "success", error: null };
      },
      getHistory: async () => {
        // Mock transaction history
        const mockTransactions = [
          {
            hash: "1a2b3c4d5e6f78901234567890123456789012345678901234567890123456",
            ledger: 48291034,
            createdAt: new Date().toISOString(),
            successful: true,
            operationCount: 1,
            feePaid: "100",
            memo: "Test transaction",
          },
          {
            hash: "2b3c4d5e6f7890123456789012345678901234567890123456789012345678",
            ledger: 48291033,
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            successful: true,
            operationCount: 2,
            feePaid: "200",
          },
        ];
        return {
          data: mockTransactions,
          error: null,
          total: mockTransactions.length,
        };
      },
      estimateFee: async () => {
        // Mock fee estimation
        return {
          data: { baseFee: "100", recommended: "200" },
          error: null,
        };
      },
    },
    soroban: {
      invokeContract: async (params: InvokeParams) => {
        void params;
        return {
          data: null,
          error: "Not implemented",
          status: "error",
        };
      },
      getEvents: async () => {
        // TODO: Implement get contract events
        return { data: null, error: null };
      },
    },
    network: {
      getNetwork: async () => {
        // Convert core client's getConfig() to the expected format
        const config = coreClient.network.getConfig();
        const networkInfo: NetworkInfo = {
          name: config.network as NetworkName,
          passphrase: config.networkPassphrase,
          rpcUrl: config.rpcUrl,
          horizonUrl: config.horizonUrl,
        };
        return { data: networkInfo, error: null };
      },
      switchNetwork: async () => {
        // TODO: Implement network switching
        // For now, return current network
        const config = coreClient.network.getConfig();
        const networkInfo: NetworkInfo = {
          name: config.network as NetworkName,
          passphrase: config.networkPassphrase,
          rpcUrl: config.rpcUrl,
          horizonUrl: config.horizonUrl,
        };
        return { data: networkInfo, error: null };
      },
    },
  };
}

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
