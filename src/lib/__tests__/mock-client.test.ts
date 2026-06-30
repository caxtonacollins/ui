import { describe, it, expect } from 'vitest';
import { MOCK_ADDRESS, NETWORKS, createMockClient } from '../mock-client';
import { DeterministicMockData, deterministicMock } from '../deterministic-mock';

describe('Mock Client - Issue #30 Fixes', () => {
  describe('Fix 1: Valid MOCK_ADDRESS', () => {
    it('should have valid Stellar Ed25519 public key format', () => {
      // Stellar public keys start with G and are 56 characters total
      expect(MOCK_ADDRESS).toMatch(/^G[A-Z0-9]{55}$/);
      expect(MOCK_ADDRESS.length).toBe(56);
    });

    it('should not contain repeating Z0J patterns', () => {
      // Old invalid address had "Z0J2Q" repeating
      expect(MOCK_ADDRESS).not.toMatch(/Z0J.*Z0J/);
    });
  });

  describe('Fix 2: switchNetwork error handling', () => {
    it('should return error for unknown network', async () => {
      const client = createMockClient();
      const result = await client.network.switchNetwork('invalidNetwork' as any);
      expect(result.error).toBeDefined();
      expect(result.error).toContain('Invalid network');
      expect(result.data).toBeNull();
    });

    it('should return error message for bad network name', async () => {
      const client = createMockClient();
      const result = await client.network.switchNetwork('badname' as any);
      expect(result.error).toContain('badname');
      expect(result.data).toBeNull();
    });

    it('should return valid config for known networks', async () => {
      const client = createMockClient();
      const result = await client.network.switchNetwork('testnet');
      expect(result.error).toBeNull();
      expect(result.data?.name).toBe('testnet');
    });

    it('should default to testnet via getNetwork', async () => {
      const client = createMockClient();
      const result = await client.network.getNetwork();
      expect(result.error).toBeNull();
      expect(result.data?.name).toBe('testnet');
    });

    it('should handle both testnet and futurenet networks', async () => {
      const client = createMockClient();
      const testnet = await client.network.switchNetwork('testnet');
      const futurenet = await client.network.switchNetwork('futurenet');

      expect(testnet.error).toBeNull();
      expect(futurenet.error).toBeNull();
      expect(testnet.data?.name).not.toEqual(futurenet.data?.name);
    });

    it('should expose NETWORKS constant for testnet and public', () => {
      expect(NETWORKS.testnet).toBeDefined();
      expect(NETWORKS.public).toBeDefined();
    });
  });

  describe('Fix 3: Deterministic mock data', () => {
    it('should generate consistent hex with same seed', () => {
      const mock1 = new DeterministicMockData(12345);
      const mock2 = new DeterministicMockData(12345);

      expect(mock1.generateHex(32)).toBe(mock2.generateHex(32));
    });

    it('should generate different hex with different seeds', () => {
      const mock1 = new DeterministicMockData(12345);
      const mock2 = new DeterministicMockData(54321);

      expect(mock1.generateHex(32)).not.toBe(mock2.generateHex(32));
    });

    it('should generate valid transaction hashes', () => {
      const hash = deterministicMock.generateTransactionHash();
      expect(hash).toMatch(/^0x[0-9a-f]{64}$/);
    });

    it('should generate valid event IDs', () => {
      const id = deterministicMock.generateEventId();
      expect(id).toMatch(/^[0-9a-f]{32}$/);
    });

    it('should generate reproducible history', () => {
      const mock = new DeterministicMockData(12345);
      const history1 = mock.generateMockHistory(3);

      const mock2 = new DeterministicMockData(12345);
      const history2 = mock2.generateMockHistory(3);

      expect(history1).toEqual(history2);
    });

    it('should generate reproducible events', () => {
      const mock = new DeterministicMockData(12345);
      const events1 = mock.generateMockEvents(2);

      const mock2 = new DeterministicMockData(12345);
      const events2 = mock2.generateMockEvents(2);

      expect(events1).toEqual(events2);
    });

    it('snapshots should be reproducible', () => {
      const mock1 = new DeterministicMockData(12345);
      const snapshot1 = {
        history: mock1.generateMockHistory(5),
        events: mock1.generateMockEvents(3),
      };

      const mock2 = new DeterministicMockData(12345);
      const snapshot2 = {
        history: mock2.generateMockHistory(5),
        events: mock2.generateMockEvents(3),
      };

      expect(snapshot1).toEqual(snapshot2);
    });
  });
});
