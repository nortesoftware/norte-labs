Corrections to my two comments above.

52 of the 175 died with the 2.x message, not 53. darwin-memo was counted because its error text names `mcp.server.fastmcp`, but what it hit is `No module named 'mcp'`: `mcp` is an optional extra of that package and was not installed. The count is of packages whose error is the rename itself, not any import failure that mentions `mcp`, and no other cell carries that message. That is 29.7% of the cells; of the other 123, 65 completed the handshake and 58 failed for other reasons.

The rename is not all that 2.0 broke. Ten of those 58, all among the 71 that set a floor and no ceiling, stop at a `list_tools()` decorator with `AttributeError: 'Server' object has no attribute 'list_tools'`: 2.0 removed that decorator from the low-level `Server`, which now takes `on_list_tools=` in its constructor. So at least 62 of 175, 35.4%, are broken by 2.0. I did not examine the other 48 PyPI failures for a 2.0 cause.

The publisher key split io.github.CSOAI-ORG in two: 18 of its packages under its GitHub owner, 3 under its registry namespace. Counted as one publisher, 32 of 142 publishers had at least one server broken by the rename, 22.5%, and the cluster-robust 95% interval for the per-package rate is 14.1 to 45.3%, design effect 5.3. 19 of the 52 are that publisher's; without it the rate is 33 of 154, 21.4%. The range in my first comment, between a fifth and a third, is the rename alone.

13 packages require `mcp` 2.x, not 17. The other four declare `>=1.x,<3`, which accepts both majors, and all four started.

51 of the 52 are among the 71 that set a floor and no ceiling, not all of them. The other one, vs-filesystem-mcp-server, gets `mcp` through `fastmcp`.
