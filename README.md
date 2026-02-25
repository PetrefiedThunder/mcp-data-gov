# mcp-data-gov

MCP server for [data.gov](https://data.gov) — meta-search across 250,000+ federal datasets. No API key required.

## Tools

| Tool | Description |
|------|-------------|
| `search_datasets` | Search federal datasets by keyword, org, format |
| `get_dataset` | Get full metadata for a specific dataset |
| `list_organizations` | List federal agencies publishing data |
| `list_tags` | Browse popular dataset topics/tags |
| `get_resource` | Get download URL for a specific file/resource |

## Install

```bash
npm install
npm run build
```

## Usage with Claude Desktop

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

## No API Key Required

## License

MIT
