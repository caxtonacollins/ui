import { describe, it, expect } from "vitest";
import * as exports from "@/components/index";

describe("Public Exports Smoke Test", () => {
  it("exports are valid functions or components", () => {
    const namedExports = Object.entries(exports);
    
    expect(namedExports.length).toBeGreaterThan(0);

    for (const [name, value] of namedExports) {
      // Components, providers, and hooks should be functions
      // We skip checking types as they disappear at runtime and won't be in the object
      expect(typeof value).toBe("function", `Export ${name} is not a function. Got ${typeof value}`);
    }
import { describe, expect,it } from 'vitest';

import * as exports from '../components/index';

describe('Public exports surface', () => {
  it('exposes all public component exports', () => {
    expect(exports.FeeEstimator).toBeTypeOf('function');
    expect(exports.AddressDisplay).toBeTypeOf('function');
    expect(exports.AssetPill).toBeTypeOf('function');
    expect(exports.ContractEventFeed).toBeTypeOf('function');
  });

  it('re-exports public types from client', () => {
    type Expected = {
      account: exports.AccountData;
      balance: exports.Balance;
      transaction: exports.Transaction;
      claimableBalance: exports.ClaimableBalance;
      contractEvent: exports.ContractEvent;
      networkInfo: exports.NetworkInfo;
      invokeParams: exports.InvokeParams;
    };
    const actual: Expected = {} as Expected;
    expect(actual).toBeDefined();
  });
});
