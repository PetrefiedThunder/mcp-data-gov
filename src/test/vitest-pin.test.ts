import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

// GHSA-82fw-gwwq-j7x9, GHSA-xp26-3454-mjgp, and GHSA-qxg6-89mg-rqv8 are fixed
// in vitest / @vitest/mocker 4.1.12. An exact older pin (4.0.18) kept npm from
// selecting that release.
const PATCHED_VITEST = "4.1.12";

describe("vitest security pin", () => {
  it("pins vitest and @vitest/mocker at 4.1.12", () => {
    const root = new URL("../../", import.meta.url);
    const manifest = JSON.parse(readFileSync(new URL("package.json", root), "utf8")) as {
      devDependencies: { vitest: string };
    };
    const lock = JSON.parse(readFileSync(new URL("package-lock.json", root), "utf8")) as {
      packages: Record<string, { version?: string }>;
    };

    expect(manifest.devDependencies.vitest).toBe(PATCHED_VITEST);
    expect(lock.packages["node_modules/vitest"]?.version).toBe(PATCHED_VITEST);
    expect(lock.packages["node_modules/@vitest/mocker"]?.version).toBe(PATCHED_VITEST);
  });
});
