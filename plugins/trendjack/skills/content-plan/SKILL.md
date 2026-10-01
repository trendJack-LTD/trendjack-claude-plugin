---
name: content-plan
description: Use when the user wants a content calendar, a weekly content plan, a posting schedule, or ideas for what to publish next week from their trendJack signals. Claude reads the last seven days of trendJack signals and the brand profile, picks the signals worth publishing about, and lays them out as a calendar across the brand's content pillars, with a format, an angle and a source signal for each slot.
---

# Plan a week of content

This skill turns one week of trendJack signals into a content calendar for the coming week. Each slot ties one signal to one content pillar and one format. The calendar spreads the slots across the brand's pillars, so no pillar goes silent and no pillar crowds out the rest.

## If the trendJack tools are missing

The trendJack tools come from the trendJack connector, for example `get_connection` and `list_signals`. Some apps load connector tools only when needed. Search your tools for "trendJack" before you decide they are missing. Other connectors can also have tools named `search` and `fetch`. Use the ones from trendJack.

If a trendJack tool call asks the user to connect, wait until they finish. Then make the same call again.

If the tools are still missing, trendJack is not connected yet. Say so in one sentence, then give the steps for the user's app:

- **Claude Code:** if you have a trendJack `authenticate` tool, call it and give the user the link it returns. Otherwise, ask the user to run `/mcp`, pick trendJack and choose **Authenticate**.
- **claude.ai and Claude Desktop:** ask the user to open **Customize > Plugins > trendJack > Connectors** and select **Connect** next to trendJack.

trendJack then asks the user to sign in or create an account, and to pick the workspace that Claude saves to. If the tools still do not appear after the user connects, ask them to start a new chat. Never tell the user to disconnect and connect again when trendJack was never connected.

When you talk to the user, call the workspace with `writable: true` the workspace they connected. Do not call it "writable".

## Steps

1. Call `get_connection`. Pick the workspace. Use the one the user names, or the one with `writable: true`. If `profileBuilt` is false, stop and offer the onboarding skill.
2. Call `get_company_profile` for that workspace. Note the active pillars, the voice guide, and the tracked competitors and prospects.
3. Call `list_signals` twice, once with `status` set to `"kept"` and once with `status` set to `"waiting"`. Use these arguments in both calls:
   - `workspace`: the workspace from step 1
   - `since`: seven days before now, as an ISO 8601 instant
   - `limit`: 100

   Leave out cleared signals, because someone has already dismissed them. If either call returns `truncated: true`, say so.
4. Ask the user two things, unless they have already said:
   - how many slots they want per week. Suggest five, one per weekday.
   - which formats they publish. The formats are `linkedin`, `x`, `long_form`, `email_prospect` and `email_journalist`.
5. Shortlist candidates. Prefer kept signals, then high urgency, then high relevance. Call `get_signal` for each candidate. Read at most 20.
6. Build the calendar. Follow the planning rules below and the shape in `references/calendar-template.md`.
7. Show the calendar. Then list the pillars that got no slot, with one line on why.
8. Offer next steps:
   - Draft any slot with the draft-post skill. Give the slot's signal id and format.
   - Keep the signals the plan uses, or clear the rest, with the triage skill.

This skill only reads. It creates no drafts and changes no signal status unless the user asks for a next step.

## Planning rules

- **Spread the pillars.** Give each active pillar at least one slot when the week has enough good signals for it. Give no pillar more than two slots in five.
- **Match the format to the age of the news.** A short reaction post (`linkedin` or `x`) works only while the story is fresh. Put a signal published in the last 36 hours early in the week. A story older than three days needs a format that argues from it, such as `long_form`, or it needs an angle that does not depend on the news being new.
- **Use the tracked companies.** A signal about a tracked prospect can fill an `email_prospect` slot. A story the press is already covering can fill an `email_journalist` slot.
- **One news event, one slot.** When several signals cover the same event, use the one with the best source.
- **Leave a gap honestly.** If no signal fits a pillar, say so. Do not stretch a weak signal to fill a slot.
- **Keep the angle in the company's voice.** Each angle is something this company can say from its position. No generic thought-leadership filler.

## Quality bar

- Each slot names its signal id, its pillar, its format and its angle.
- Each angle is one sentence that takes a position. "Share thoughts on the news" fails.
- No slot repeats another slot's news event or angle.
- The calendar fits on one screen. Put the reasoning in the "Why" column, not in paragraphs around the table.
