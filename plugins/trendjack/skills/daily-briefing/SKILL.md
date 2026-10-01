---
name: daily-briefing
description: Use when the user asks what happened today, wants a morning briefing, asks what is new in trendJack, or asks which news to act on. Claude reads the trendJack signals from the last 48 hours and the brand profile, leads with the high-urgency signals, groups the rest by theme, says in one line why each matters to the company, and ends with the two or three signals worth acting on today.
---

# Daily briefing

A signal is one news item that trendJack judged relevant to a workspace. trendJack scans the news on weekdays and stores new signals with status waiting. A daily plan scans every weekday. A weekly plan scans one weekday a week. This skill briefs the user on the recent ones, most urgent first.

## If the trendJack tools are missing

The trendJack tools come from the trendJack connector, for example `get_connection` and `list_signals`. Some apps load connector tools only when needed. Search your tools for "trendJack" before you decide they are missing. Other connectors can also have tools named `search` and `fetch`. Use the ones from trendJack.

If a trendJack tool call asks the user to connect, wait until they finish. Then make the same call again.

If the tools are still missing, trendJack is not connected yet. Say so in one sentence, then give the steps for the user's app:

- **Claude Code:** if you have a trendJack `authenticate` tool, call it and give the user the link it returns. Otherwise, ask the user to run `/mcp`, pick trendJack and choose **Authenticate**.
- **claude.ai and Claude Desktop:** ask the user to open **Customize > Plugins > trendJack > Connectors** and select **Connect** next to trendJack.

trendJack then asks the user to sign in or create an account, and to pick the workspace that Claude saves to. If the tools still do not appear after the user connects, ask them to start a new chat. Never tell the user to disconnect and connect again when trendJack was never connected.

When you talk to the user, call the workspace with `writable: true` the workspace they connected. Do not call it "writable".

## Steps

1. Call `get_connection`. Pick the workspace to brief on:
   - If the user names a workspace, use its `ref`.
   - If only one workspace exists, use it.
   - If several exist and the user names none, brief on the one with `writable: true` and list the others by name. Use `"all"` only when the user asks for every workspace.
   - If `runInProgress` is true, say that today's scan is still running and the briefing may miss its results.
   - If `profileBuilt` is false, stop. Tell the user that trendJack needs a brand profile first, and offer the onboarding skill.
2. Call `get_company_profile` for the same workspace. Note the company name, the voice guide and the active pillars. If `signalsRunning` is false, tell the user `pausedBecause` at the top of the briefing.
3. Call `list_signals` with these arguments:
   - `workspace`: the workspace from step 1
   - `since`: 48 hours before now, as an ISO 8601 instant
   - `status`: `"waiting"`
   - `limit`: 50

   If `truncated` is true, say how many signals you read and that more exist.
4. If the list is empty, say that no new signals arrived in the last 48 hours. Give `lastCompletedRunOn` from step 1. If that date is more than two days ago, the workspace may scan weekly. Offer a briefing on the last seven days instead. Stop there.
5. Call `get_signal` for each signal you will write about. Read high-urgency signals first. Read at most 15 signals. `list_signals` gives only a short entry, and `get_signal` adds the summary, the relevance reason, the suggested angle and the article link.
6. Write the briefing in the shape below.

## Shape of the briefing

1. **High urgency.** List each high-urgency signal first. trendJack rates a signal high when the story ranked high and the source published it under 36 hours ago, so these go stale fastest.
2. **By theme.** Group the other signals under the content pillar they connect to. Use the pillar titles from the profile. Put a signal that fits no pillar under "Other".
3. **For each signal**, write one line:
   - the title, linked to `articleUrl`
   - the source name and the publish date
   - why it matters to this company in particular, in one sentence
4. **Act on today.** End with the two or three signals worth acting on today. For each, say the action: draft a post in a named format, comment to the press, write to a prospect, or keep it and wait.

## Quality bar

- The relevance reason is trendJack's view, not the last word. Check it against the profile. If you disagree, say so in the line.
- "Why it matters" names a pillar, a keyword, or a tracked competitor or prospect. A line that would fit any company fails.
- Do not restate the summary. The user can open the article.
- Keep the briefing short enough to read in two minutes. If more than 15 signals exist, brief on the 15 most urgent and most relevant, and say how many you left out.
- Do not change any signal's status. This skill only reads.

## Next steps to offer

- To draft a post from a signal, use the draft-post skill with the signal id.
- To keep or clear the waiting signals, use the triage skill.
