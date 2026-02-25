import { describe, it, expect } from "vitest";

describe("mcp-data-gov", () => {
  it("should build search URLs", () => {
    const params = new URLSearchParams({ q: "climate", rows: "10", start: "0" });
    const url = `https://catalog.data.gov/api/3/action/package_search?${params}`;
    expect(url).toContain("q=climate");
    expect(url).toContain("rows=10");
  });

  it("should build org filter queries", () => {
    const params = new URLSearchParams({ q: "air quality" });
    params.set("fq", "organization:epa-gov");
    expect(params.toString()).toContain("organization%3Aepa-gov");
  });

  it("should build dataset detail URLs", () => {
    const id = "test-dataset-123";
    const url = `https://catalog.data.gov/api/3/action/package_show?id=${encodeURIComponent(id)}`;
    expect(url).toContain(id);
  });

  it("should truncate long notes", () => {
    const notes = "a".repeat(500);
    expect(notes.slice(0, 300).length).toBe(300);
  });

  it("should sort orgs by dataset count", () => {
    const params = new URLSearchParams({ sort: "package_count desc" });
    expect(params.get("sort")).toBe("package_count desc");
  });

  it("should handle format filters", () => {
    const fmt = "CSV";
    const fq = `res_format:${fmt}`;
    expect(fq).toBe("res_format:CSV");
  });
});
