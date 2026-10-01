---
name: onboarding
description: Use when the user wants to set up TrendJack, build or refresh their company's brand profile, or change the voice guide, content pillars or alert keywords. Also use when another TrendJack skill finds that the profile is not built or that daily signals are paused. Claude researches the company's own website, LinkedIn and X pages, writes the voice guide, the content pillars and the alert keywords, shows them to the user, and saves the complete profile to the TrendJack workspace with populate_company_profile.
---

# Build the TrendJack brand profile

TrendJack reads the news for a company every weekday and keeps the items that matter to it. It judges every news item against the brand profile. The profile has three parts that you write:

- The **voice guide**: how the company sounds. TrendJack's drafter reads it word for word every time it writes a draft.
- The **content pillars**: the 3 to 8 recurring themes the company can credibly post about. Every signal must justify itself against one pillar by name.
- The **alert keywords**: the terms that make news relevant to the company. TrendJack matches them against the news every day.

You do the research yourself, then save the result with `populate_company_profile`. A vague profile makes the daily scan vague, so the quality bar below matters more than speed.

## Before you start

The TrendJack tools `search` and `fetch` look up stored signals. They do not read the web. For the research, use your own web search and web fetch tools. If you have no tool that opens a web page, tell the user. Ask them to paste the text of the home page, the about page and the product pages instead.

## Steps

1. Call `get_connection`. Find the one workspace with `writable: true`. That is the only workspace `populate_company_profile` can write to. Tell the user its name before you go on. If the user names a different workspace, explain that this connection writes only to the writable one. They can reconnect TrendJack and choose the other workspace.
2. Call `get_company_profile` with `workspace` set to the writable workspace's `ref`. Note what is stored today: the website, the LinkedIn page, the X handle, the voice guide, the pillars, the keywords and the language rules.
3. Get the website. Use the website the user gives you. Otherwise use `websiteUrl` from the stored profile. If neither exists, ask the user for it and stop until they reply. Every field must come from the company's own pages.
4. Research the company. Follow the research rules below.
5. Write the voice guide, the pillars and the keywords. Follow `references/profile-fields.md` for each field.
6. Show the user the complete profile before you save it. Show the company name, the website, the LinkedIn page, the X handle, the voice guide, every pillar with its description, and every keyword. If a profile exists, say what changes from the stored one. Ask the user to confirm or correct it.
7. Call `populate_company_profile` with the complete profile. The call replaces the stored voice guide, every pillar and every keyword, so send every field, not only the ones you changed. Keep the stored LinkedIn page and X handle unless the user changes them.
8. Report the result from the tool's output: the workspace name, the number of pillars and keywords saved, and `onboardingComplete`. Tell the user that the next daily scan uses the new profile.

If `populate_company_profile` returns an error, show the error text to the user. Fix the input it names and call the tool again only after the user agrees.

## Research rules

- Read the company's own site before you write anything. Start at the home page. Then open the pages it points to that say what the company does and who it serves: product, solutions, about, customers and blog.
- A page you did not open is not evidence. If the site contradicts what you recall, the site wins.
- Read the company's LinkedIn and X presence too, where it has one. The marketing site says what a company wants to be. Its posts say how it actually talks. Where the two disagree on tone, the social voice is the truer one.
- Ground every field in what you found. Where the site is thin, say so in the voice guide. Do not invent detail.

## What populate_company_profile accepts

| Field | Rule |
| --- | --- |
| `websiteUrl` | Required. The company's website. |
| `companyName` | Optional. The company's name as it writes it. |
| `linkedinUrl` | Optional. The company's LinkedIn page. |
| `xHandle` | Optional. The company's X handle. |
| `voiceGuide` | Required. Not empty. |
| `pillars` | 3 to 8 items. Each has a `title` of 120 characters or fewer and a `description`. |
| `keywords` | Not the company's own name. TrendJack drops duplicates without regard to case and keeps at most 40. |

The tool leaves the hand-written language rules unchanged. Those rules live in the TrendJack app. Do not try to set them here.

## Quality bar

Before you show the profile to the user, check each item:

- Each statement in the voice guide names something you saw on a page or in a post. An adjective that fits any company fails.
- You can name the page that supports each pillar.
- Each pillar description says, in one or two sentences, what news belongs under it.
- The keywords cover the market, the technologies, the customers' industries and the problems the company sells against.
- No keyword is the company's own name. No keyword is so generic that it matches most business news.

## After the profile is saved

- If `get_company_profile` reported `signalsRunning: false` with a `pausedBecause` reason, call `get_company_profile` again. Tell the user whether the reason is gone.
- Suggest the daily-briefing skill once the next scan has run.
