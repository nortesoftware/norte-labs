Sent 2026-09-17 03:47 UTC as https://github.com/zed-industries/extensions/issues/7640.

Title: `repository` in extension.toml is copied to the API and the extension page unchecked; 5 of 73 context-server extensions point somewhere else

I read the source of every extension that provides a context server (73 on 2026-09-16, from `api.zed.dev/extensions?provides=context-servers`) to recover what each one installs and runs, following the `repository` the API returns to find it. The API copies the field verbatim from the published manifest (`fetch_extension_manifest` in crates/collab sets `repository: manifest.repository`), and zed.dev/extensions/<id> renders it as the "Visit Repository" link. For five of the 73 it does not lead to the extension:

| id | `repository` in extension.toml (= API, = the page's link) | submodule in .gitmodules | what is at the link |
|---|---|---|---|
| ask-starknet-mcp | https://github.com/YOUR_GH/ask-starknet-zed | 0xpantera/ask-starknet-mcp-server | 404, the template placeholder; the extension page shows 29,314 downloads (2026-09-17) and links it |
| maho-lsp | https://github.com/mahocommerce/maho-zed | MahoCommerce/zed | 404, no redirect; the first commit of MahoCommerce/zed (2026-04-04) already declared this name |
| serena-context-server | https://github.com/oraios/serena | delano/zed-mcp-server-serena | the upstream product; no extension.toml |
| mcp-server-sonarqube | https://github.com/SonarSource/sonarqube-mcp-server | SonarSource/sonarqube-mcp-server-zed | the upstream product; no extension.toml |
| arch-mcp | https://github.com/nihalxkumar/arch-mcp | nihalxkumar/arch-mcp-zed-extension | the upstream product; no extension.toml |

The other 67 match their submodule (a 73rd, mcp-server-axiom, was removed from this repository in #6952 on 2026-07-24 and is still served by the API and by zed.dev/extensions/mcp-server-axiom; a separate matter). For three of the five the value is the choice zed-industries/zed#35184 said not to make, the product instead of the extension; for two it is a name that never existed. In the PRs that added the five (#3852, #5501, #3304, #3427, #3882) the field was not raised, and in #3852 the placeholder went in with the submodule.

As far as I can read ci.yml and src/lib/validation.js, nothing here looks at `repository`: the checks cover the id, the submodule URL scheme and location, the version match, the licence and the manifest name. The check that zed-industries/zed#59189 added to the extension CLI in August (non-empty, parses as a URL with a host) is not active here, since ZED_EXTENSION_CLI_SHA is pinned to 9ee3c503 from June, and it would in any case pass `https://github.com/YOUR_GH/ask-starknet-zed`. #924 reported the same defect on a theme two years ago and was closed as the author's problem.

Two things would close it. At PR time, require that `repository`, after normalisation, equal the submodule URL; that needs no network, matches the policy zed-industries/zed#35184 stated, and would have caught all five (a placeholder check alone catches one). And the five entries want a fix in their own repositories followed by a version bump, since there is no `repository` field in extensions.toml to patch here. I can open the five upstream PRs, or the CI check, whichever is wanted; the data and the method are at https://github.com/nortesoftware/norte-labs/tree/main/measurements/agent-plugins.
