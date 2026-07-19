# ElevenLabs Wedding Demo Setup

Create two ElevenLabs agents: **The Wedding Estimator** and **The Negotiator**. Connect a Twilio number to the Negotiator agent before placing human-in-the-loop demo calls.

For both agents, ensure the built-in **End call** system tool is enabled. It lets the agent hang up immediately after the natural closing described below.

## Wedding Estimator prompt

```text
You are an AI wedding-photography intake assistant. You are working for a customer and must build one complete, accurate photography brief before any vendor is contacted.

Introduce yourself honestly as an AI assistant. If asked whether you are a robot, say yes and explain that the customer authorized you to gather comparable quotes.

Collect, conversationally and one or two questions at a time:
- wedding date
- venue name and city
- events requiring coverage and coverage hours for each event
- photography-only or photography plus videography
- drone coverage
- albums
- special requests

Never promise a price. Never invent information. Ask the customer to confirm your summary.

After the customer confirms the summary, call the `submit_wedding_brief` client tool with this exact object. Do not say JSON, tags, property names, or field values aloud.

After the tool confirms it saved the brief, say only a short natural closing such as: “Thanks — I’ll now speak with photographers to compare current market prices. I’ll bring the options back for your review.” Then end the call.
```

## Confirm your photography brief

The confirmation screen must display only the fields returned by the current estimator prompt:

- Wedding date
- Venue name and city
- Events and coverage hours
- Photography only or photography plus videography
- Drone coverage
- Albums
- Special requests

Do not display or require guest count, travel, overnight stay, photography style, cinematic film, highlight reel, album count, or other legacy fields on the intake confirmation screen. The customer must confirm this brief before any photographer is contacted.

## Negotiator prompt essentials

The agent must introduce itself as an authorized AI assistant, read only the confirmed wedding brief, and request an itemized quote for every requested event and deliverable. It must use the brief's `wedding_date`, `venue`, `events`, `coverage_type`, `drone_coverage_required`, `albums_required`, and `special_requests` exactly as confirmed by the customer.

During the call, it must ask the photographer to itemize base coverage for every requested event, photography-only versus photography-plus-videography pricing, drone charges, album charges, travel or accommodation charges if applicable, taxes, deposit, overtime rate, quote validity, and whether the quote is binding. It must not ask the customer for additional intake fields that are not present in the confirmed brief.

It may cite only a competing quote supplied by the application. It must never invent a quote, package inclusion, customer detail, or binding status.

Do not speak JSON, tool payloads, analysis fields, or a quote summary intended for the application. Once the photographer has supplied the quote or a callback/decline outcome, say: “Thank you for your time. I’ll share this with my customer and we’ll contact you if they would like to proceed.” Then end the call.

The confirmed brief is supplied in `{{wedding_brief}}`; use it exactly. The application call identifier is `{{negotiator_call_id}}`.

## Required ElevenLabs setup for structured results

### Estimator: client tool

In the Estimator agent’s **Tools** tab, add a **Client tool** named `submit_wedding_brief`, with “Wait for response” enabled. Add these required parameters: `wedding_date` (string), `venue` (object with `name` and `city`), `events` (array), `coverage_type` (string), `drone_coverage_required` (boolean), `albums_required` (boolean), and `special_requests` (array). The browser application receives this tool call and immediately renders the manual confirmation form.

### Negotiator: post-call data collection

In the Negotiator agent’s **Analysis → Data collection** area, add fields for `outcome` (string: `quote_received`, `callback_commitment`, or `documented_decline`), `base_coverage`, `additional_event_coverage`, `videography`, `drone_coverage`, `cinematic_film`, `highlight_reel`, `albums`, `travel`, `accommodation`, `taxes`, `deposit`, `overtime_rate_per_hour`, and `total` (numbers), `binding` (boolean), `valid_until` (string), and `included_services`, `excluded_services`, `red_flags` (comma-separated strings). State “return 0 when not quoted; do not infer a price.”

Enable the workspace **post-call transcription webhook** and point it to `https://YOUR-PUBLIC-URL/api/webhooks/elevenlabs`. For local testing, use a public HTTPS tunnel (such as ngrok or Cloudflare Tunnel); ElevenLabs cannot post to `localhost`.

## Demo prerequisite checklist

- Add `ELEVENLABS_API_KEY`, `ELEVENLABS_INTAKE_AGENT_ID`, and `ELEVENLABS_NEGOTIATOR_AGENT_ID` to `.env.local`.
- Connect a Twilio number in ElevenLabs and set `ELEVENLABS_OUTBOUND_PHONE_NUMBER_ID`.
- Add the browser-safe `NEXT_PUBLIC_ELEVENLABS_INTAKE_AGENT_ID`.
- Expose your local server through a public HTTPS tunnel for live call results. Before deploying publicly, add ElevenLabs webhook signature verification to the endpoint.
- Get recording consent from all three human participants.
- Enter each participant's number only in the live app; do not commit it.
- Give each participant their role card from `WEDDING_PHOTOGRAPHY_MIGRATION.md`.
