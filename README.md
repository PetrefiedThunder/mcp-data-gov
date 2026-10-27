# mcp-data-gov

Search 250,000+ federal datasets from data.gov across all government agencies.

> **Free API** — No API key required.

## Tools

| Tool | Description |
|------|-------------|
| `search_datasets` | Search across 250K+ federal datasets on data.gov by keyword. |
| `get_dataset` | Get detailed metadata for a specific dataset by ID. |
| `list_organizations` | List federal organizations/agencies that publish data on data.gov. |
| `list_tags` | List popular tags/topics used across datasets. |
| `get_resource` | Get metadata and download URL for a specific resource/file within a dataset. |

## Installation

```bash
git clone https://github.com/PetrefiedThunder/mcp-data-gov.git
cd mcp-data-gov
npm install
npm run build
```

## Usage with Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "data-gov": {
      "command": "node",
      "args": ["/path/to/mcp-data-gov/dist/index.js"]
    }
  }
}
```

## Usage with npx

```bash
npx mcp-data-gov
```

## License

Apache-2.0
