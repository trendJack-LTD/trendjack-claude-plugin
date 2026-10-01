# TrendJack for Claude

TrendJack is the backend and the daily agent. This plugin is how you use it in Claude.

Every weekday, TrendJack reads the news for your brand. It keeps the items that matter to your company and stores them as signals in your TrendJack workspace. The plugin connects Claude to that workspace and adds five skills. The skills tell Claude how to brief you, triage your signals, plan your content and draft posts in your brand voice.

## How TrendJack differs from a skill

A skill is a set of instructions. It has no daily research, no stored brand profile and no signal history. Without TrendJack, a skill can only work with what you paste into the chat.

TrendJack does the work between your conversations:

- It scans the news for your company every weekday, including news about the competitors and prospects you track.
- It stores your brand profile: the voice guide, the content pillars and the alert keywords.
- It learns from your decisions. The signals you keep and clear become examples for the next scan.
- It writes drafts in your brand voice and keeps them in a review queue for your team.

The plugin bundles the TrendJack connection with the skills, so you install both in one step.

## What the plugin contains

- **A connector** to the TrendJack MCP server at `https://app.trendjack.io/api/mcp`.
- **Five skills:**

| Skill | Use it to |
| --- | --- |
| `onboarding` | Research your company and save its brand profile to TrendJack. |
| `daily-briefing` | Get a briefing on the last 48 hours of signals, most urgent first. |
| `triage` | Go through the waiting signals and keep or clear each one. |
| `content-plan` | Turn a week of signals into a content calendar across your pillars. |
| `draft-post` | Draft a post, an email or a pitch from one signal, and save your edits. |

The plugin contains no agents, hooks or executables.

## Install

You need a TrendJack account with at least one workspace. Sign up at [app.trendjack.io](https://app.trendjack.io).

### On claude.ai

1. Go to **Customize > Plugins > Add > Add marketplace**.
2. Enter the repository URL: `https://github.com/trendJack-LTD/trendjack-claude-plugin`.
3. Install the **TrendJack** plugin.
4. Open the plugin's **Connectors** tab and connect the TrendJack connector.
5. Sign in to TrendJack and choose the workspace that Claude may write to.

On Team and Enterprise plans, an Owner adds the connector for the organization first. Each member then connects with their own TrendJack account.

If you already added the TrendJack connector, the plugin uses the same URL. You see one set of TrendJack tools, not two.

### In Claude Code

Run these commands in your shell:

```bash
claude plugin marketplace add trendJack-LTD/trendjack-claude-plugin
claude plugin install trendjack@trendjack
```

Start a session and run `/mcp`. Select the `trendjack` server and sign in to TrendJack. The skills appear as `/trendjack:daily-briefing`, `/trendjack:triage` and so on. Claude also loads each skill when your request matches it.

## Use it

Ask Claude in plain words, for example:

- "Set up TrendJack for acme.com."
- "What happened in my world today?"
- "Go through my waiting signals."
- "Plan next week's posts from this week's signals."
- "Draft a LinkedIn post from the first signal."

## Data

The plugin has no code of its own. It sends nothing until you connect the TrendJack connector. After that, Claude sends tool calls to TrendJack at `https://app.trendjack.io/api/mcp`, over HTTPS, signed in with your TrendJack account.

Claude sends TrendJack this data:

- the brand profile that the onboarding skill writes: your website, company name, LinkedIn page, X handle, voice guide, content pillars and alert keywords
- your decisions on signals: keep, clear and the clear reason
- requests for drafts: a signal id and a format
- the text of drafts you edit
- your search queries over your signals, and the filters you choose when you list signals or drafts

TrendJack returns your workspaces, your brand profile, your signals and your drafts. Claude reads them in your conversation.

Reads can cover every workspace you authorised for the connection. Writes go only to the one workspace you chose when you connected. No tool posts, sends or publishes anything: drafts stay in TrendJack until you publish them yourself.

When you create a draft, TrendJack writes it with its own drafting model. For onboarding, Claude reads your company's public website, LinkedIn page and X profile with Claude's own web tools. TrendJack does not fetch those pages for the plugin.

## License

MIT. See [LICENSE](LICENSE).
