---
name: triage
description: Use when the user wants to go through their waiting TrendJack signals, clear the queue, decide what to keep, dismiss signals that do not fit, or undo a decision on a signal. Claude reads each waiting signal against the brand profile, recommends keep or clear with a reason, asks the user to confirm, and records each decision with set_signal_status. Kept and cleared signals teach the daily scan what the company wants.
---

# Triage waiting signals

A signal is one news item that TrendJack judged relevant to a workspace. Each signal has one of three statuses:

- **waiting**: no one has decided yet
- **kept**: someone has taken it on
- **cleared**: dismissed, with an optional reason

TrendJack uses kept and cleared signals as examples for its next scan. It scores a story like the kept ones higher and a story like the cleared ones lower. A clear with reason `no_time` is the exception: it teaches the scan nothing. So each decision changes what the user sees after the next scan, and the reason matters.

## Steps

1. Call `get_connection`. Find the workspace with `writable: true`. `set_signal_status` changes signals only in that workspace. Note its `waiting` and `waitingHigh` counts. If the user wants to triage another workspace, explain that this connection can only read it.
2. Call `get_company_profile` for the writable workspace. Note the active pillars, the keywords, and the tracked competitors and prospects.
3. Build the batch with `list_signals`. In each call, set `workspace` to the writable workspace's `ref` and `status` to `"waiting"`.
   1. If `waitingHigh` is above zero, call it with `urgency` set to `"high"` and `limit` set to 25. Put these signals first.
   2. Call it again with `limit` set to 25 and no `urgency`. Add the signals that the first call did not return, until the batch holds 25.
4. Call `get_signal` for each signal in the batch. Read the summary, the relevance reason and the suggested angle.
5. Recommend a decision for each signal. Use the decision rules below.
6. Show the batch as a table: the title, the urgency, your recommendation, the reason, and one line of why. Ask the user to confirm, change or skip each row. Do not record a decision the user has not confirmed.
7. Call `set_signal_status` once for each confirmed row:
   - keep: `action` is `"keep"`
   - clear: `action` is `"clear"` and `reason` is one of the four reasons below
   - undo: `action` is `"restore"`

   Your client may ask the user to approve each call, because the tool overwrites the earlier decision.
8. Report what you recorded, from each call's output: how many signals are kept, how many cleared and with which reasons, and how many are still waiting. If the batch was 25 and more signals wait, offer the next batch.

If `set_signal_status` returns an error for a signal, report the error text and go on with the rest.

## Decision rules

Keep the signal when the company can credibly say something about it and someone will act on it. Suggest the action: a post, a press comment, an email to a prospect or a pitch to a journalist.

Clear the signal with the reason that fits:

| Reason | Use it when |
| --- | --- |
| `not_relevant` | The story does not touch any pillar, keyword or tracked company. The scan should find fewer stories like it. |
| `not_our_angle` | The story is relevant, but the company has no credible position on it, or the suggested angle is advice it has no standing to give. |
| `already_covered` | The company has already posted about this story or this news event. |
| `no_time` | The story is good, but nobody can act on it now. This reason does not teach the scan, so use it only when the story deserved a keep. |

Pass `reason` only with `"clear"`. The tool refuses a reason with any other action.

## Quality bar

- Each recommendation names the pillar, keyword or tracked company that it turns on. "Seems relevant" fails.
- The relevance reason is TrendJack's view, not the last word. Disagree with it when the profile says otherwise.
- Use `not_relevant` honestly. A story that is relevant but badly angled is `not_our_angle`. The two reasons teach the scan different things.
- Prefer `no_time` to a wrong reason when the user is only busy.
- When two signals cover the same news event, keep the one with the better source and clear the other with `already_covered`.
- A high-urgency signal goes stale within a day. If the user keeps one, offer the draft-post skill now.

## Undo a decision

To undo a keep or a clear, call `set_signal_status` with `action` set to `"restore"`. The signal returns to waiting, and TrendJack drops its stored clear reason. To find a cleared signal, call `list_signals` with `status` set to `"cleared"`, or call the TrendJack `search` tool with a phrase from its title.
