# trendJack for Claude

trendJack is the backend and the daily agent. This plugin is how you use it in Claude.

On weekdays, trendJack reads the news for your brand: every weekday on a daily plan, and one weekday a week on a weekly plan. It keeps the items that matter to your company and stores them as signals in your trendJack workspace. The plugin connects Claude to that workspace and adds five skills. The skills tell Claude how to brief you, triage your signals, plan your content and draft posts in your brand voice.

## How trendJack differs from a skill

A skill is a set of instructions. It has no daily research, no stored brand profile and no signal history. Without trendJack, a skill can only work with what you paste into the chat.

trendJack does the work between your conversations:

- It scans the news for your company on a schedule, including news about the competitors and prospects you track.
- It stores your brand profile: the voice guide, the content pillars and the alert keywords.
- It learns from your decisions. The signals you keep and clear become examples for the next scan.
- It writes drafts in your brand voice and keeps them in a review queue for your team.

The plugin bundles the trendJack connection with the skills, so you install both in one step.

## What the plugin contains

- **A connector** to the trendJack MCP server at `https://app.trendjack.io/api/mcp`.
- **Five skills:**

| Skill | Use it to |
| --- | --- |
| `onboarding` | Research your company and save its brand profile to trendJack. |
| `daily-briefing` | Get a briefing on the last 48 hours of signals, most urgent first. |
| `triage` | Go through the waiting signals and keep or clear each one. |
| `content-plan` | Turn a week of signals into a content calendar across your pillars. |
| `draft-post` | Draft a post, an email or a pitch from one signal, and save your edits. |

The plugin contains no agents, hooks, scripts or executables. It is Markdown and JSON only.

## Install

You need a trendJack account with at least one workspace. Sign up at [app.trendjack.io](https://app.trendjack.io).

### On claude.ai and Claude Desktop

1. Go to **Customize > Plugins > Add > Add marketplace**.
2. Enter the repository URL: `https://github.com/trendJack-LTD/trendjack-claude-plugin`.
3. Install the **trendJack** plugin.

Installing the plugin does not connect trendJack. Connect it in one of two ways:

- **From the chat.** Ask Claude for something, such as "What happened today?". The first time Claude calls trendJack, it shows a **Connect** button in the chat. Select it, sign in, and Claude carries on.
- **Before you start.** Go to **Customize > Plugins > trendJack > Connectors** and select **Connect** next to trendJack.

Either way, trendJack opens a window. Sign in or create an account, then pick the workspace that Claude saves to. If the trendJack tools do not appear in a chat that was already open, start a new chat.

On Team and Enterprise plans, an Owner adds the connector for the organization first. Each member then connects with their own trendJack account.

If you already added the trendJack connector, the plugin uses the same URL. You see one set of trendJack tools, not two.

### In Claude Code

Run these commands in your shell:

```bash
claude plugin marketplace add trendJack-LTD/trendjack-claude-plugin
claude plugin install trendjack@trendjack
```

Start a session and run `/mcp`. Select the `trendJack` server, choose **Authenticate** and sign in to trendJack. The skills appear as `/trendjack:daily-briefing`, `/trendjack:triage` and so on. Claude also loads each skill when your request matches it.

### Connect to a different workspace

A connection saves to one workspace, the one you pick when you connect. To save to another workspace, disconnect trendJack and connect again:

- On claude.ai: **Customize > Connectors > trendJack > Disconnect**, then **Connect**.
- In Claude Code: `/mcp`, select `trendJack`, choose **Clear authentication**, then **Authenticate**.

## Use it

Ask Claude in plain words, for example:

- "Set up trendJack for acme.com."
- "What happened in my world today?"
- "Go through my waiting signals."
- "Plan next week's posts from this week's signals."
- "Draft a LinkedIn post from the first signal."

## Data

The plugin runs no code of its own. It sends nothing until you connect the trendJack connector. After that, Claude sends tool calls to trendJack at `https://app.trendjack.io/api/mcp`, over HTTPS, signed in with your trendJack account.

Claude sends trendJack this data:

- the brand profile that the onboarding skill writes: your website, company name, LinkedIn page, X handle, voice guide, content pillars and alert keywords
- your decisions on signals: keep, clear and the clear reason
- requests for drafts: a signal id and a format
- the text of drafts you edit
- your search queries over your signals, and the filters you choose when you list signals or drafts

trendJack returns your workspaces, your brand profile, your signals and your drafts. Claude reads them in your conversation.

Reads can cover every workspace you authorised for the connection. Writes go only to the one workspace you chose when you connected. No tool posts, sends or publishes anything: drafts stay in trendJack until you publish them yourself.

When you create a draft, trendJack writes it with its own drafting model. For onboarding, Claude reads your company's public website, LinkedIn page and X profile with Claude's own web tools. trendJack does not fetch those pages for the plugin.

## License

MIT. See [LICENSE](LICENSE).
