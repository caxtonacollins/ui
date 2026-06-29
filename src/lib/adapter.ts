import {
  StellarWalletsKit,
  WalletNetwork,
  allowAllModules,
  FREIGHTER_ID,
} from "@creit.tech/stellar-wallets-kit";
import { type SorokitClient as CoreSorokitClient } from "sorokit-core";
import {
  type InvokeParams,
  type SorokitClient as LocalSorokitClient,
  type NetworkInfo,
  type NetworkName,
} from "./client";
interface SorobanClient {
  invokeContract(params: { contractId: string; method: string; params: any[] }): Promise<any>;
  getEvents(params: { contractId: string; limit: number }): Promise<any[]>;
}

export interface ClientAdapterConfig {
  walletAdapter?: any; // Freighter, xBull, Albedo
  network?: 'testnet' | 'public';
}

export interface AdapterResponse<T> {
  data: T | null;
  error: string | null;
  status: 'success' | 'error' | 'pending';
}

/**
 * Create an adapter that wraps the sorokit-core client to match the expected interface.
 */
export function createClientAdapter(
  coreClient: CoreSorokitClient,
): LocalSorokitClient {
  const kit = new StellarWalletsKit({
    network: WalletNetwork.TESTNET,
    selectedWalletId: FREIGHTER_ID,
    modules: allowAllModules(),
  });

  return {
    wallet: {
      connect: async () => {
        try {
          await kit.openModal({
            onWalletSelected: async (option) => {
              kit.setWallet(option.id);
            },
            modalTitle: "Connect Wallet",
          });
          const publicKey = await kit.getPublicKey();
          return {
            data: { address: publicKey },
            error: null,
            status: "success",
          };
        } catch (error) {
          return {
            data: null,
            error: error instanceof Error ? error.message : "Failed to connect",
            status: "error",
          };
        }
      },
      disconnect: async () => {
        // Mock disconnection
      },
      getAddress: async () => {
        try {
          const publicKey = await kit.getPublicKey();
          return { data: publicKey, error: null };
        } catch {
          return { data: null, error: "Not connected" };
        }
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
        try {
          const result = await coreClient.soroban.invokeContract(params);
          return { data: result, error: null, status: "success" };
        } catch (e) {
          return { data: null, error: e instanceof Error ? e.message : "Error", status: "error" };
        }
      },
      getEvents: async (contractId: string, limit?: number) => {
        try {
          const result = await coreClient.soroban.getEvents(contractId, limit);
          return { data: result, error: null };
        } catch (e) {
          return { data: null, error: e instanceof Error ? e.message : "Error" };
        }
      },
    },
    network: {
      getNetwork: async () => {
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
