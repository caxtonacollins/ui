/**
 * mock-client.ts — simulates sorokit-core for development/demo.
 * Replace with: import { createSorokitClient } from "sorokit-core"
 */

import type {
  SorokitClient,
  Balance,
  AccountData,
  NetworkInfo,
  Transaction,
  ClaimableBalance,
  ContractEvent,
} from "./client";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
const randHex = (len: number) =>
  Array.from({ length: len }, () =>
    Math.floor(Math.random() * 16).toString(16),
  ).join("");

const MOCK_ADDRESS = "GBAMQXTQ7IQKPZXJKZJQZJQZJQZJQZJQZJQZJQZJQZJQZJQZJQZJQ";

const MOCK_BALANCES: Balance[] = [
  { asset: "XLM", balance: "1042.5000000", assetType: "native" },
  {
    asset: "USDC",
    balance: "250.0000000",
    assetType: "credit_alphanum4",
    assetCode: "USDC",
    assetIssuer: "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
  },
  {
    asset: "yXLM",
    balance: "88.1234567",
    assetType: "credit_alphanum4",
    assetCode: "yXLM",
    assetIssuer: "GARDNV3Q7YGT4AKSDF25LT32YSCCW4EV22Y2TV3I2PU2MMXJTEDL5T55",
  },
];

const MOCK_ACCOUNT: AccountData = {
  address: MOCK_ADDRESS,
  sequence: "174792435",
  subentryCount: 3,
};

const MOCK_HISTORY: Transaction[] = Array.from({ length: 20 }, (_, i) => ({
  hash: randHex(64),
  ledger: 48291034 - i * 12,
  createdAt: new Date(Date.now() - i * 3600000).toISOString(),
  successful: i !== 3 && i !== 11,
  operationCount: Math.floor(Math.random() * 3) + 1,
  feePaid: (100 + Math.floor(Math.random() * 400)).toString(),
  memo: i % 4 === 0 ? `memo-${i}` : undefined,
}));

const MOCK_CLAIMABLE: ClaimableBalance[] = [
  {
    id: "00000000" + randHex(56),
    asset: "XLM",
    amount: "25.0000000",
    sponsor: "GCEZWKCA5VLDNRLN3RPRJMRZOX3Z6G5CHCGZWM9CQJUQE3QLQZJQ",
    claimants: [{ destination: MOCK_ADDRESS, predicate: null }],
  },
  {
    id: "00000000" + randHex(56),
    asset: "USDC:GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN",
    amount: "10.0000000",
    sponsor: "GDQJUTQYK2MQX2VGDR2FYWLIYAQIEGXTQVTFEMGH0BELWGWHKJQ",
    claimants: [{ destination: MOCK_ADDRESS, predicate: null }],
  },
];

const MOCK_EVENTS: ContractEvent[] = Array.from({ length: 8 }, (_, i) => ({
  id: randHex(32),
  contractId: "CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2KM",
  type: ["transfer", "mint", "burn", "approve"][i % 4],
  ledger: 48291035 - i * 5,
  createdAt: new Date(Date.now() - i * 600000).toISOString(),
  topics: [`topic_${i}_a`, `topic_${i}_b`],
  value: { amount: (Math.random() * 1000).toFixed(7), from: MOCK_ADDRESS },
}));

const NETWORKS: Record<string, NetworkInfo> = {
  testnet: {
    name: "testnet",
    passphrase: "Test SDF Network ; September 2015",
    rpcUrl: "https://soroban-testnet.stellar.org",
    horizonUrl: "https://horizon-testnet.stellar.org",
  },
  mainnet: {
    name: "mainnet",
    passphrase: "Public Global Stellar Network ; September 2015",
    rpcUrl: "https://soroban-mainnet.stellar.org",
    horizonUrl: "https://horizon.stellar.org",
  },
  futurenet: {
    name: "futurenet",
    passphrase: "Test SDF Future Network ; October 2022",
    rpcUrl: "https://rpc-futurenet.stellar.org",
    horizonUrl: "https://horizon-futurenet.stellar.org",
  },
  localnet: {
    name: "localnet",
    passphrase: "Standalone Network ; February 2017",
    rpcUrl: "http://localhost:8000/soroban/rpc",
    horizonUrl: "http://localhost:8000",
  },
};

let currentNetwork = NETWORKS.testnet;
let connectedAddress: string | null = null;

export function createMockClient(): SorokitClient {
  return {
    wallet: {
      connect: async () => {
        await delay(1200);
        connectedAddress = MOCK_ADDRESS;
        return {
          data: { address: MOCK_ADDRESS },
          error: null,
          status: "success",
        };
      },
      disconnect: async () => {
        await delay(300);
        connectedAddress = null;
      },
      getAddress: async () => ({ data: connectedAddress, error: null }),
    },

    account: {
      getAccount: async () => {
        await delay(600);
        return { data: MOCK_ACCOUNT, error: null, status: "success" };
      },
      getBalances: async () => {
        await delay(800);
        return { data: MOCK_BALANCES, error: null };
      },
      getClaimableBalances: async () => {
        await delay(700);
        return { data: MOCK_CLAIMABLE, error: null };
      },
      claimBalance: async () => {
        await delay(1800);
        return {
          data: { hash: randHex(64), ledger: 48291036, successful: true },
          error: null,
        };
      },
    },

    transaction: {
      submit: async () => {
        await delay(2000);
        return {
          data: { hash: randHex(64), ledger: 48291034, successful: true },
          error: null,
          status: "success",
        };
      },
      getStatus: async () => {
        await delay(400);
        return { data: "success", error: null };
      },
      getHistory: async (_address, page = 1, limit = 10) => {
        await delay(700);
        const start = (page - 1) * limit;
        return {
          data: MOCK_HISTORY.slice(start, start + limit),
          error: null,
          total: MOCK_HISTORY.length,
        };
      },
      estimateFee: async () => {
        await delay(300);
        return { data: { baseFee: "100", recommended: "200" }, error: null };
      },
    },

    soroban: {
      invokeContract: async (params) => {
        await delay(1500);
        return {
          data: {
            result: `Invoked ${params.method} on ${params.contractId.slice(0, 12)}...`,
            ledger: 48291035,
            returnValue: "AAAABQAAAAAAAAAAAAAAAAAAAAo=",
          },
          error: null,
          status: "success",
        };
      },
      getEvents: async () => {
        await delay(600);
        return { data: MOCK_EVENTS, error: null };
      },
    },

    network: {
      getNetwork: async () => {
        await delay(200);
        return { data: currentNetwork, error: null };
      },
      switchNetwork: async (name) => {
        await delay(600);
        currentNetwork = NETWORKS[name] ?? NETWORKS.testnet;
        return { data: currentNetwork, error: null };
      },
    },
  };
}
