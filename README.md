# TrendJack plugins for Claude

This repository is a Claude plugin marketplace. It holds two plugins:

| Plugin | Connects to | Who it is for |
|---|---|---|
| `trendjack` | `https://app.trendjack.io/api/mcp` | TrendJack customers |
| `trendjack-dev` | `https://app.dev.trendjack.io/api/mcp` | The TrendJack team, to test changes on the dev deployment |

[`plugins/trendjack/README.md`](plugins/trendjack/README.md) describes the plugin, its skills and the data it sends.

## Change a skill

1. Edit the files in `plugins/trendjack/`. Never edit `plugins/trendjack-dev/` by hand.
2. Run `node scripts/build-dev.mjs` to rebuild `plugins/trendjack-dev/`.
3. Run `node scripts/check-tools.mjs`. It fails when a skill names a tool, an argument or a field that `tools.json` does not list.
4. Run `scripts/validate.sh`. It runs `claude plugin validate --strict` on the marketplace and on each plugin.
5. Commit both plugin folders together. CI fails when the dev copy is stale.

When the TrendJack MCP server adds, renames or removes a tool, update `tools.json` first.

## Test on the dev deployment

The dev deployment must be reachable from the internet. Vercel Deployment Protection must list `app.dev.trendjack.io` as an exception, or Claude cannot complete OAuth.

On claude.ai:

1. Go to **Customize > Plugins > Add > Add marketplace** and enter `trendJack-LTD/trendjack-claude-plugin`. While the repository is private, connect GitHub and give the Claude GitHub App access to it.
2. Install **TrendJack (dev)**.
3. Open its **Connectors** tab, connect, and sign in with your dev account.
4. After you push a change, open the marketplace and select **Check for updates**, or turn on **Sync automatically**.

In Claude Code:

```bash
claude plugin marketplace add trendJack-LTD/trendjack-claude-plugin
claude plugin install trendjack-dev@trendjack
claude plugin marketplace update trendjack   # after each push
```

Start a session and run `/mcp` to sign in. The skills appear as `/trendjack-dev:<skill>`.

## Branches

`dev` is the default branch, and all changes land there first. `main` is the release branch that Anthropic's directory tracks. Remove the `trendjack-dev` entry from `marketplace.json` before the repository goes public.
