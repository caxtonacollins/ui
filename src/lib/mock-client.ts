import type { SorokitClient, Balance, Transaction, ContractEvent } from './client';
import { DeterministicMockData } from './deterministic-mock';

/**
 * Valid Stellar Ed25519 public key (base32: G + 55 chars A-Z2-7)
 * Verified against Stellar's key format: starts with G, 56 total chars, alphabet A-Z2-7
 */
export const MOCK_ADDRESS = 'GBSZCAHASQRY4ZCZZKSB47AMVUDKDVZQAGVHGSV3ZVZYAZ6ZGKR2GKBF';

export const NETWORKS = {
  testnet: {
    passphrase: 'Test SDF Network ; September 2015',
    rpc_url: 'https://soroban-testnet.stellar.org',
  },
  public: {
    passphrase: 'Public Global Stellar Network ; September 2015',
    rpc_url: 'https://soroban.stellar.org',
  },
};

const VALID_NETWORKS = new Set(['mainnet', 'testnet', 'futurenet', 'localnet']);

const MOCK_BALANCES: Balance[] = [
  {
    asset: 'XLM',
    balance: '1000.0000000',
    assetType: 'native',
  },
  {
    asset: 'USDC',
    balance: '250.0000000',
    assetType: 'credit_alphanum4',
    assetCode: 'USDC',
    assetIssuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
  },
];

/**
 * Generate deterministic mock transaction history.
 * Creates a new DeterministicMockData instance with a fixed seed each call
 * so snapshots are always reproducible.
 */
export function generateMockHistory(count: number = 5): Transaction[] {
  const mock = new DeterministicMockData(12345);
  return Array.from({ length: count }, (_, i) => ({
    hash: mock.generateTransactionHash(),
    ledger: 1000000 + i,
    createdAt: new Date(1700000000000 - i * 1000).toISOString(),
    successful: true,
    operationCount: 1,
    feePaid: '100',
    memo: undefined,
  }));
}

/**
 * Generate deterministic mock contract events.
 */
export function generateMockEvents(count: number = 3): ContractEvent[] {
  const mock = new DeterministicMockData(12345);
  return Array.from({ length: count }, (_, i) => ({
    id: mock.generateEventId(),
    contractId: mock.generateHex(56),
    type: 'contract_event',
    ledger: 1000000 + i,
    createdAt: new Date(1700000000000 - i * 500).toISOString(),
    topics: [mock.generateHex(32), mock.generateHex(32)],
    value: mock.generateHex(64),
  }));
}

// Kept for backward compatibility with legacy imports
export const MOCK_HISTORY = generateMockHistory(5);
export const MOCK_EVENTS = generateMockEvents(3);

/**
 * Create a full SorokitClient-compatible mock client for tests.
 * All methods return resolved promises so tests don't need real network access.
 */
export function createMockClient(): SorokitClient {
  return {
    wallet: {
      connect: async () => ({
        data: { address: MOCK_ADDRESS },
        error: null,
        status: 'success' as const,
      }),
      disconnect: async () => {},
      getAddress: async () => ({ data: MOCK_ADDRESS, error: null }),
    },

    account: {
      getAccount: async (address: string) => ({
        data: {
          address,
          sequence: '1',
          subentryCount: 2,
        },
        error: null,
        status: 'success',
      }),
      getBalances: async (_address: string) => ({
        data: MOCK_BALANCES,
        error: null,
      }),
      getClaimableBalances: async (_address: string) => ({
        data: [],
        error: null,
      }),
      claimBalance: async (_balanceId: string) => ({
        data: { hash: 'mock-hash', ledger: 1, successful: true },
        error: null,
      }),
    },

    transaction: {
      submit: async (_tx: unknown) => ({
        data: { hash: 'mock-hash', ledger: 1, successful: true },
        error: null,
        status: 'success',
      }),
      getStatus: async (_txHash: string) => ({
        data: 'success' as const,
        error: null,
      }),
      getHistory: async (_address: string, _page?: number, limit?: number) => {
        const all = generateMockHistory(10);
        const records = limit ? all.slice(0, limit) : all;
        return {
          data: records,
          error: null,
          total: all.length,
        };
      },
      estimateFee: async () => ({
        data: { baseFee: '100', recommended: '200' },
        error: null,
      }),
    },

    soroban: {
      invokeContract: async (_params) => ({
        data: null,
        error: null,
        status: 'success',
      }),
      getEvents: async (_contractId: string, _limit?: number) => ({
        data: MOCK_EVENTS,
        error: null,
      }),
    },

    network: {
      getNetwork: async () => ({
        data: {
          name: 'testnet' as const,
          passphrase: NETWORKS.testnet.passphrase,
          rpcUrl: NETWORKS.testnet.rpc_url,
          horizonUrl: 'https://horizon-testnet.stellar.org',
        },
        error: null,
      }),
      switchNetwork: async (network) => {
        if (!VALID_NETWORKS.has(network)) {
          return { data: null, error: `Invalid network: ${network}` };
        }
        return {
          data: {
            name: network,
            passphrase: '',
            rpcUrl: '',
            horizonUrl: '',
          },
          error: null,
        };
      },
    },
  };
}
