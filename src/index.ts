#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const BASE_URL = "https://catalog.data.gov/api/3";
const USER_AGENT = "mcp-data-gov/1.0.0";
const RATE_LIMIT_MS = 500;
let lastRequestTime = 0;

async function rateLimitedFetch(url: string): Promise<any> {
  const now = Date.now();
  const elapsed = now - lastRequestTime;
  if (elapsed < RATE_LIMIT_MS) {
    await new Promise((r) => setTimeout(r, RATE_LIMIT_MS - elapsed));
  }
  lastRequestTime = Date.now();

  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`data.gov API error: ${res.status} — ${body.slice(0, 500)}`);
  }
  return res.json();
}

const server = new McpServer({
  name: "mcp-data-gov",
  version: "1.0.0",
});

server.tool(
  "search_datasets",
  "Search across 250K+ federal datasets on data.gov by keyword.",
  {
    query: z.string().describe("Search terms (e.g. 'climate change', 'crime statistics', 'census')"),
    organization: z.string().optional().describe("Filter by organization (e.g. 'nasa-gov', 'noaa-gov', 'epa-gov')"),
    format: z.string().optional().describe("Filter by resource format (e.g. 'CSV', 'JSON', 'API', 'XML')"),
    rows: z.number().min(1).max(100).default(10),
    start: z.number().min(0).default(0),
  },
  async ({ query, organization, format: fmt, rows, start }) => {
    const params = new URLSearchParams({
      q: query,
      rows: String(rows),
      start: String(start),
    });
    if (organization) params.set("fq", `organization:${organization}`);
    if (fmt) params.set("fq", `${params.get("fq") ? params.get("fq") + " " : ""}res_format:${fmt}`);

    const data = await rateLimitedFetch(`${BASE_URL}/action/package_search?${params}`);
    // Simplify output
    const results = data.result?.results?.map((r: any) => ({
      id: r.id,
      title: r.title,
      notes: r.notes?.slice(0, 300),
      organization: r.organization?.title,
      metadata_modified: r.metadata_modified,
      num_resources: r.num_resources,
      resources: r.resources?.map((res: any) => ({
        name: res.name,
        format: res.format,
        url: res.url,
      })),
      tags: r.tags?.map((t: any) => t.display_name),
    }));

    return {
      content: [{
        type: "text" as const,
        text: JSON.stringify({ count: data.result?.count, results }, null, 2),
      }],
    };
  }
);

server.tool(
  "get_dataset",
  "Get detailed metadata for a specific dataset by ID.",
  {
    datasetId: z.string().describe("Dataset ID from search results"),
  },
  async ({ datasetId }) => {
    const data = await rateLimitedFetch(`${BASE_URL}/action/package_show?id=${encodeURIComponent(datasetId)}`);
    return { content: [{ type: "text" as const, text: JSON.stringify(data.result, null, 2) }] };
  }
);

server.tool(
  "list_organizations",
  "List federal organizations/agencies that publish data on data.gov.",
  {
    query: z.string().optional().describe("Filter by name"),
    limit: z.number().min(1).max(200).default(25),
  },
  async ({ query, limit }) => {
    const params = new URLSearchParams({
      all_fields: "true",
      limit: String(limit),
      sort: "package_count desc",
    });
    if (query) params.set("q", query);

    const data = await rateLimitedFetch(`${BASE_URL}/action/organization_list?${params}`);
    const orgs = data.result?.map((o: any) => ({
      name: o.name,
      title: o.title,
      datasetCount: o.package_count,
    }));
    return { content: [{ type: "text" as const, text: JSON.stringify(orgs, null, 2) }] };
  }
);

server.tool(
  "list_tags",
  "List popular tags/topics used across datasets.",
  {
    query: z.string().optional().describe("Filter tags by name"),
    limit: z.number().min(1).max(200).default(25),
  },
  async ({ query, limit }) => {
    const params = new URLSearchParams({ limit: String(limit) });
    if (query) params.set("query", query);

    const data = await rateLimitedFetch(`${BASE_URL}/action/tag_list?${params}`);
    return { content: [{ type: "text" as const, text: JSON.stringify(data.result, null, 2) }] };
  }
);

server.tool(
  "get_resource",
  "Get metadata and download URL for a specific resource/file within a dataset.",
  {
    resourceId: z.string().describe("Resource ID from dataset details"),
  },
  async ({ resourceId }) => {
    const data = await rateLimitedFetch(`${BASE_URL}/action/resource_show?id=${encodeURIComponent(resourceId)}`);
    return { content: [{ type: "text" as const, text: JSON.stringify(data.result, null, 2) }] };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("Fatal:", err);
  process.exit(1);
});
