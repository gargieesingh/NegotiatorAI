# Agent Run: calls, quotes, vendor discovery, and metrics

## Why completed calls still show `Calling...`

The call cards do **not** learn that a call ended directly from Twilio or the ElevenLabs outbound-call response. The current lifecycle is:

1. `POST /api/calls/initiate` saves a call in `src/lib/callStore.ts` with status `calling`, then asks ElevenLabs to place the outbound call.
2. The browser polls `GET /api/calls/:id/status` every four seconds for up to five minutes.
3. Only `POST /api/webhooks/elevenlabs` changes the stored status to `complete` or `declined`.
4. The webhook receives the transcript, uses the dynamic variable `negotiator_call_id` to find the saved call, normalizes the transcript into a quote, and updates the in-memory record.

Therefore a vendor hanging up, declining to answer, or the agent ending the conversation is not enough by itself to update the screen. If the post-call webhook cannot reach the application, the call stays `calling`; after five minutes the browser proceeds with zero quotes and renders the shown Pipeline Error.

The call-status route now also checks Twilio on each browser poll. A `busy` or `no-answer` result becomes **Not picked up**, while a completed telephony call becomes **Processing quote** until ElevenLabs provides its transcript. ElevenLabs' post-call webhook remains necessary to decide whether an ended conversation contains a usable quote or a documented decline.

`localhost:3000` is the direct reason this occurs during local testing. ElevenLabs runs outside your computer and cannot send a webhook to `http://localhost:3000`. The webhook endpoint must be a public HTTPS URL such as:

```text
https://YOUR-PUBLIC-TUNNEL/api/webhooks/elevenlabs
```

Configure that URL in the ElevenLabs workspace's **post-call transcription webhook** setting. A tunnel such as ngrok or Cloudflare Tunnel can expose the local Next.js server; a deployed environment should use its public application URL. The webhook must receive the `post_call_transcription` event and preserve the conversation initiation dynamic variables. The relevant setup guidance is also in `docs/ELEVENLABS_GENERAL_AGENT_SETUP.md`.

Important current limitations:

- Call state now uses Vercel KV when `KV_REST_API_URL` and `KV_REST_API_TOKEN` are configured, with an in-memory fallback only for local development. Configure a Vercel KV database for the deployed project; without it, a server restart, hot reload, multi-instance deployment, or a webhook handled by a different instance can still lose the match.
- There is no Twilio status callback route or provider-status reconciliation. The post-call transcript webhook is the only terminal-status source.
- The webhook endpoint currently does not verify an ElevenLabs signature, deduplicate repeated events, or persist raw webhook payloads.
- A successful webhook can still produce no numeric quote if the transcript does not explicitly state a price. That is intentionally treated as a callback/decline-style outcome instead of inventing a price.

## What happens after the three calls

When the webhook arrives for each call, the dashboard card changes to:

- `Quote received` when a price-bearing quote is extracted.
- `Documented decline` when the structured outcome is a decline.
- `Setup required` only when initiation fails or the backend stores an error.

After all terminal calls, or after the five-minute polling limit, the pipeline:

1. collects available structured quotes;
2. stores them in browser local storage under `negotiator_wedding_photo_quotes` (the legacy key is also used for general jobs);
3. requires at least two price-bearing quotes to create a negotiation strategy;
4. uses the lowest qualifying quote as leverage and calls the highest qualifying quote as the negotiation target;
5. stores the negotiation result in local storage;
6. asks Claude to generate a report; and
7. shows the Done state and the Evidence Report link.

With one valid quote, the run can finish but has no negotiation result. With no valid quote, it stops at the current Pipeline Error instead of showing a report.

## Six discovered vendors, three calls

The Google Places route can return up to ten unique businesses. Agent Run now retains and displays the first six results in a discovery panel. The first three remain the only ones used to construct `demoParticipants` and initiate calls.

This distinction matters in the current demo: the displayed company names and locations come from Google Places, but calls are deliberately routed to the three fixed, consented/verified demo phone numbers in `src/app/agent-run/page.tsx`. They are not calls to the Google Places business phone numbers.

## How quote extraction and metrics work now

There is no standalone metric-calculation service despite the UI step being named **Metrics**. It is a quote-normalization stage.

For a general job such as the MacBook request:

1. Gemini 2.5 Flash classifies the request and produces a vertical configuration, including expected quote line-item keys.
2. ElevenLabs supplies the post-call transcript.
3. `normalizeGenericQuote` in `src/lib/genericQuote.ts` asks Gemini to return strict JSON. It may use only amounts explicitly stated in the transcript and must cite each amount's transcript-turn index.
4. Line items not allowed by the job configuration, non-numeric amounts, and invalid evidence indexes are discarded.
5. `total` is taken from the extracted `total` item, or falls back to `base_price`; `final_price` is set to that value. Binding status, validity, inclusions, exclusions, and red flags are also retained.

The visible metrics/report values are then derived as follows:

| Value | Current derivation |
| --- | --- |
| Quotes collected | Count of completed calls that contain a structured quote object. |
| Quote total / final price | Extracted `total`, otherwise `base_price`; no price is inferred. |
| Negotiation leverage | Lowest price-bearing completed quote. |
| Negotiation target | Highest price-bearing completed quote. |
| Savings achieved | `max(0, initial target price - negotiated final price)`. |
| Recommended vendor on `/report` | Lowest `final_price`; the current report page does not actually require binding/itemization for this UI recommendation. |
| Claude report ranking | Claude is instructed to prefer transparent, binding, itemized, scope-complete quotes and to use only supplied transcript evidence. |

## Observed code-quality gaps to address before production

- Replace the in-memory call store with a durable database keyed by internal call ID and ElevenLabs conversation ID.
- Add signed, idempotent webhook ingestion with raw event storage and retries.
- Twilio status is now reconciled during browser polling for busy/no-answer/failed/completed states. For production scale, replace polling with an authenticated provider-status callback as well.
- Use a proper location parser or a user-confirmed field. Agent Run still uses a short city-list heuristic; this change adds `Rohtak` and resolves it to `Rohtak, Haryana`, but other unlisted locations still fall back to `Local City`.
- Do not present the fixed demo-phone routing as live calls to the discovered businesses.
