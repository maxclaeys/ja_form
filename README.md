# ja_form — adaptive requirements capture (prototype)

A demonstration for Rod and Nagi of what the enquiry form could do that the current
Google Form cannot. Not a live form. Nothing is stored or written to the pipeline sheet.

**Architecture:** this repo is the whole product. The page is static and hosted on
GitHub Pages. n8n sits behind it as the API only — one webhook, one model call. There
is no server-side rendering, no build step and no framework.

```
GitHub Pages  →  index.html + flow.js        the form
                        │  POST (text/plain)
                        ▼
n8n            →  /webhook/ja-form            assist | validate | handoff
                        │
                        ▼
TokenMix       →  claude-sonnet-4.5
```

It argues four things, each visible on screen:

1. **Questions are conditional.** Choosing a single day out hides 20 of the 34
   questions, listed struck through on the right with a count. One engine, not one
   form per tour type.
2. **The form answers back.** Anywhere marked in ochre, a customer can ask about the
   question instead of leaving it blank, and the reply can fill the field in.
3. **Answers are checked before they arrive.** Room allocation is counted against
   group size; region count is checked against nights.
4. **The output is structured**, with a completeness score and a draft reply.

The trade branch adds a fifth: **one tree serves very different buyers.** It branches
on who is asking, how settled their brief already is, and what they want back — not on
trip type. Purpose is a single question gating four sub-blocks, so a school study tour,
a sports exchange and a costed luxury itinerary run through the same engine without any
of them seeing the others' questions. `test_b2b.js` asserts exactly that against three
real enquiries.

---

## Files

| File | What it is |
|---|---|
| `index.html` | The whole front end — engine, styling, demo fallbacks. No dependencies. |
| `flow.js` | Every question, and the conditions that show it. **Edit here, not in the engine.** |
| `n8n-workflow.json` | Reference copy of the backend as it is live. Not deployed from here. |
| `test_b2b.js` | Coverage test for the B2B branch. `node test_b2b.js`. Uses the real `showIf` evaluator copied from `index.html`. |

## Run it

Open `index.html` in a browser. It works standalone: if the backend cannot be reached,
AI replies come from `DEMO_REPLIES` in `index.html`, so a demo can never be killed by
a failed API call.

## Publish it

```
git init
git add index.html flow.js n8n-workflow.json README.md
git commit -m "Adaptive requirements capture prototype"
git branch -M main
git remote add origin https://github.com/maxclaeys/ja_form.git
git push -u origin main
```

Then Settings → Pages → Source: *Deploy from a branch* → `main` / `/ (root)` → Save.

Live at `https://maxclaeys.github.io/ja_form/` — **no query string needed.** The n8n
endpoint is baked in as the default. `?api=https://...` still overrides it if you want
to point the same page at a different instance.

## The backend

Built, published and live. Nothing to import unless you are rebuilding it.

- Workflow `7TDoflF5vxqJUUoo` on `n8n.seichodigital.com`
- `POST https://n8n.seichodigital.com/webhook/ja-form`
- Provider: **TokenMix**, OpenAI-compatible chat completions
- Credential: `Custom Auth tokenmix` (`httpCustomAuth`). The key never leaves n8n.
- Model: `claude-sonnet-4.5`. TokenMix uses dot-separated names — the Anthropic-style
  `claude-sonnet-4-6` does not resolve. Override per request with `body.model`.

The badge in the page header shows which mode you are in: attached but not yet called,
live, or falling back to canned replies.

## Contract

`POST` → `{ action, flow_version, question_id?, question?, answers, model? }`
`action` is one of `assist` | `validate` | `handoff`; anything else is treated as `assist`.

Response → `{ ok, action, question_id, flow_version, model, usage, parse_note, data }`

- `assist` → `data: { answer, suggested_value, confidence }`
- `validate` → `data: { issues: [{ field, severity, message }] }`
- `handoff` → `data: { summary, open_points, reply }`

`parse_note` is `null` on a clean parse. It is a string when the model wrapped its
answer in prose or a code fence and the object had to be recovered. Watch it — a
steady stream of non-null values means the prompt needs work, not the parser.

`validate` is implemented in the workflow but the front end still uses local rules
for it, so the checks fire offline. Switching is a small edit; keep the local rules
as the offline fallback.

## Notes on the build

- **No CORS preflight.** The page posts `Content-Type: text/plain`, a CORS-safelisted
  value, so the browser sends no `OPTIONS` at all. The payload is still JSON; the
  Build node parses the raw string. This is deliberate — it is what lets a Pages
  origin call n8n cross-origin without depending on preflight handling. If you change
  it back to `application/json`, you take preflight handling back on.
- **n8n v2.15.0 constraints** are respected: no `fetch` or `$helpers` in Code nodes,
  so the API call is a dedicated HTTP Request node; `Object.assign` throughout,
  never spread.
- **Item fields do not survive the HTTP Request node** on this instance, even with
  `responseFormat: 'text'` + `outputPropertyName`, contrary to the
  `n8n-sdk-constraints` skill. `Parse response` therefore reads `action`,
  `question_id` and `flow_version` from `$('Build request').item.json`. Do not
  "simplify" this back to reading `$json` — a `validate` call silently became an
  `assist` call that way, and returned nothing.
- **Model output is not reliably bare JSON.** It has been observed writing the prose
  answer and then repeating it inside a fenced block. `Parse response` tries the whole
  reply, then every fenced block last-first, then a string-aware brace-balanced scan,
  and accepts only an object shaped for the requested action.
- **Prompt injection.** Answers are public web input, passed under a labelled
  `CUSTOMER ANSWERS` block the system prompt marks as untrusted, and length-capped
  (600 chars per value, 60 keys). Tested with an injected instruction demanding a GBP
  quote and spiritual framing: refused both times. The model has no tools and no write
  access, so the blast radius is a bad reply, not a bad action.
- **Brand constraints** are in the system prompt: no prices, no spiritual framing,
  UK English, no emojis, no markdown, no invented operational detail.

## Content warning

`DEMO_REPLIES` in `index.html` is placeholder content written for the demonstration.
The operational detail in it has not been checked against what Japan Adventurer
actually offers. The live model has the same exposure: it has referred unprompted to
the Shimanami Kaido and to citrus-growing areas around Matsuyama. Both are real, but
neither has been checked against what JA actually runs. Verify before a customer sees
any of it.

## Not built

- **Pre-fill from the pasted brief.** `b_brief_paste` collects the itinerary or RFP
  the customer has already written, but nothing yet reads it. The intended behaviour
  is to send it with the question set, have the model propose answers with a
  confidence per field, and show them pre-filled and marked as read from the brief so
  the customer corrects rather than retypes. This is what makes the B2B path
  reasonable to complete; without it the trade branch is a long form.
- **Grounding in real content.** The assistant answers from the prompt, not from
  japanadventurer.com. The `clean_content` column the WP extraction pipeline already
  produces is the retrieval source when this becomes real.
- **Writing to the pipeline sheet.** The handover is rendered, not written.
- **Japanese.** English only. Matters for Nagi and Miura; doubles the prompt tuning.
- **Per-tour-type authoring.** `flow.js` is hand-written. The path Rod asked for is
  generating it from a Sheet, so a new tour type is a row rather than a deploy.

## Before this is anything but a demo

Set `allowedOrigins` on the n8n webhook to `https://maxclaeys.github.io` instead of
`*`, and set the same origin in the `Access-Control-Allow-Origin` response header.
