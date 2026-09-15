Numbers for what you described. On 2026-09-11 I took a seeded random sample of 180 PyPI servers out of the 3,497 stdio PyPI packages listed in the official MCP registry, installed each one into a clean venv with `uv pip install name==version` (the version the registry lists, Python 3.13, nothing pinned by me), started the console script and sent `initialize`.

175 installed. 53 died at import with the 2.x message, `No module named 'mcp.server.fastmcp'`. Of the other 122, 65 completed the handshake and 57 failed for other reasons, judging from stderr: other exceptions at startup, a usage banner because the registry entry omits a subcommand, a missing module, a credential check. That is 30% of the cells, but it is not 30% of the ecosystem. 21 of the 53 belong to one publisher, io.github.CSOAI-ORG, which has 353 PyPI servers in the registry; all 21 I sampled failed the same way. Counting publishers instead of packages, 34 of 143 had at least one broken server, 23.8%. The cluster-robust 95% interval for the per-package rate is 15.9 to 44.7%, design effect 4.5. So between a fifth and a third of registry-listed PyPI servers don't start on a fresh install, 45 days after 2.0.0.

The registry shows all of them as `status: active`. That is the default value at publish time. The registry doesn't claim they run.

What I don't know: whether these servers work under `mcp<2` (I only ran fresh installs, which resolve to 2.x), how many of the 175 pin `mcp` at all, and whether the authors have noticed. On the npm side of the same sample I didn't see a comparable pattern, five module errors with different causes.

The per-package list is 53 lines and mostly one publisher; if it's useful here I'll add it.
