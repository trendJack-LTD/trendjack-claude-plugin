---
name: draft-post
description: Use when the user wants a post, an email, a pitch or a media comment written from a TrendJack signal or a news story TrendJack found, or wants to edit and save a TrendJack draft. Claude asks TrendJack to write the draft in the brand voice with create_draft, offers one alternative, and saves the user's edits with update_draft_text. Claude writes the draft in chat for a media comment, an executive voice, or a signal from a workspace this connection cannot write to.
---

# Draft a post from a signal

TrendJack writes drafts in the brand voice of the workspace this connection writes to. A draft stays in TrendJack. No tool posts, sends or publishes anything.

Draft formats:

| Format | What it is |
| --- | --- |
| `x` | One X post, under 280 characters in total |
| `linkedin` | A short LinkedIn post. The default. |
| `long_form` | A blog post or newsletter essay. The app calls it "Thought leadership". |
| `email_prospect` | A cold email to a prospect |
| `email_journalist` | A pitch to a journalist |

## Steps

1. **Find the signal.**
   - If the user gives a signal id, call `get_signal` with it.
   - If the user describes a story, call the TrendJack `search` tool with a short query, not a web search. Pick the result that matches, then call `get_signal` with its `id`. If several results match, ask the user which one.
2. **Find the workspace.** Call `get_connection`. Check that the signal's `workspace` is the workspace with `writable: true`. If it is not, go to "Draft in chat".
3. **Pick the format.** Use the format the user asks for. Otherwise use `linkedin`. If the user asks for a media comment or a post in an executive's voice, go to "Draft in chat".
4. **Create the draft.** Call `create_draft` with `signalId` and `format`. Each call writes a new draft and spends model tokens, so call it once per request.
   - If `alreadyRunning` is true, a draft for this signal and format is already in progress. Do not call `create_draft` again. Treat the returned draft by its `status`, as below.
   - If the draft `status` is `running`, TrendJack is still writing it. A draft takes up to about a minute. Write the alternative from step 6 first, then call `list_drafts` with `draftId`. Check at most three times. If it is still running, tell the user the draft is in their TrendJack queue and they can ask for it later.
   - If the `status` is `failed`, show `failureReason`. Offer to try again once, or to draft in chat.
   - If the tool returns an error, follow "When create_draft refuses".
5. **Show the draft.** Show the hook and the body exactly as TrendJack wrote them. For `long_form`, the hook is the headline. For the two email formats, the hook is the subject line, and the body runs from the greeting to the sign-off. Say which content pillar it ties to.
6. **Offer one alternative.** Write one alternative in chat, so the user has two to choose between. Follow `references/drafting-rules.md`. Get the voice guide, the language rules and the pillars from `get_company_profile` for the signal's workspace.
7. **Save the user's choice.** If the user picks the alternative or edits the draft, save the text:
   1. Call `list_drafts` with `draftId`. Check that `editable` is true. A draft is editable only when it is complete, its review status is draft or `changes_requested`, and it is in the writable workspace.
   2. Call `update_draft_text` with `draftId`, `hook` and `body`. For the two email formats, put the subject line in `hook`.
   3. Show the saved text from the tool's output.

   If `editable` is false, tell the user why. Either the draft is not complete, or its review status is in review, signed off or published. Give the text in chat so they can copy it.

`create_draft` moves the signal from waiting to kept. It never changes a signal that already has a decision.

## When create_draft refuses

`create_draft` returns an error and writes nothing in these cases:

- **The brand profile is not built.** Offer the onboarding skill.
- **8 drafts are already in progress in the workspace.** Wait a minute and try once more, or draft in chat.
- **The signal is not in the writable workspace.** Draft in chat.

Show the error text to the user in each case.

## Draft in chat

Write the draft yourself in these cases:

- The user wants a media comment. TrendJack's drafter needs an executive for this format, and no tool exposes executives.
- The user wants the post in an executive's own voice. Ask for the executive's name and role.
- The signal is in a workspace this connection cannot write to.
- `create_draft` refused and the user wants a draft now.

To draft in chat:

1. Call `get_company_profile` for the signal's workspace. Note the company name, the voice guide, the language rules and the active pillars.
2. Use the signal from `get_signal`: the title, the source, the summary, the relevance reason, the suggested angle and the urgency.
3. Write two alternatives. Follow `references/drafting-rules.md` for the format.
4. Say which pillar each alternative ties to.
5. Tell the user that a chat draft is not saved in TrendJack.

## Edit an existing draft

If the user wants to change a draft that is already in TrendJack:

1. Call `list_drafts` with `draftId`. If the user has no id, call `list_drafts` with `lane` set to `"yours"` and ask which draft. A list entry has no body, so then call `list_drafts` with the chosen `draftId`.
2. Show the current text and `latestReview`, if a teammate left a review note.
3. Rewrite the draft as the user asks. Follow `references/drafting-rules.md`.
4. Save it with `update_draft_text` as in step 7.

`update_draft_text` overwrites the stored text and keeps no history. Show the user the new text before you save it.

## Quality bar

- The draft takes one position and states it. It does not summarise the news.
- Every fact in the draft comes from the signal. Invent no names, numbers or quotes.
- The draft follows the voice guide and every language rule. The company's language rules outrank every other rule.
- An X post is under 280 characters, the hook and the body counted together.
- The draft reads as written by a person. Check it against the machine-writing rules in `references/drafting-rules.md` before you show it.
