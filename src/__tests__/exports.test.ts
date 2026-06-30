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
  });
});
