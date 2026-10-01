# trendJack plugin for Claude

This repository is a Claude plugin marketplace. It holds one plugin, `trendjack`, which connects to `https://app.trendjack.io/api/mcp`.

[`plugins/trendjack/README.md`](plugins/trendjack/README.md) describes the plugin, how to connect it, its skills and the data it sends.

## Change a skill

1. Edit the files in `plugins/trendjack/`.
2. Run `node scripts/check-tools.mjs`. It fails in these cases:
   - a skill names a tool, an argument or a field that `tools.json` does not list;
   - a skill does not contain `scripts/connect-section.md` word for word;
   - `.mcp.json` names a server or URL that differs from `tools.json`.
3. Run `scripts/validate.sh`. It runs `claude plugin validate --strict` on the marketplace and on the plugin.

To change what Claude says when trendJack is not connected, edit `scripts/connect-section.md`. Then paste the new text into every `SKILL.md`.

When the trendJack MCP server adds, renames or removes a tool, update `tools.json` first.

## Check the live server

`node scripts/check-live.mjs` lists the tools on the live server without a token. It fails when the server does not serve every tool, field and enum value in `tools.json`. Set `MCP_URL` to check another deployment.

The **Check the live server** workflow runs this check every day, and you can run it by hand from the Actions tab. It fails when production is behind the plugin, for example before `dev` is merged into `main` in the app repository.

## Test a change before release

In Claude Code, load the plugin from your checkout:

```bash
claude --plugin-dir ./plugins/trendjack
```

Run `/mcp` to connect. To test against another deployment, change the URL in `plugins/trendjack/.mcp.json` for that session only, and do not commit it.

On claude.ai, add this repository as a marketplace and install the plugin from the branch you pushed. Select **Check for updates** after each push.

## Branches

`dev` is the default branch, and all changes land there first. `main` is the release branch that Anthropic's directory tracks.
