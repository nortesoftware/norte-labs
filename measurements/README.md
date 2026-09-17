# measurements

- [mcp-install/](mcp-install/) — install and first start of MCP servers (npm, PyPI): install
  scripts, network, telemetry, `$HOME` paths. norte-guard's `install-trace` method over a
  seeded random sample of the official registry. Findings in
  [mcp-install/findings.md](mcp-install/findings.md).
- [agent-plugins/](agent-plugins/) — install and first start of the plugins of the AI coding
  assistants: the 42 agents of the ACP registry (Zed, JetBrains), the 330 Cursor Marketplace
  plugins, the 171 Devin marketplace plugins, the 73 Zed context-server extensions. The
  mcp-install instrument over four whole populations, run first against the ACP registry's
  own CI as field truth. Findings in [agent-plugins/findings.md](agent-plugins/findings.md);
  verification and retractions in [agent-plugins/verification.md](agent-plugins/verification.md).
