# Wedding Photography Migration Plan

## Purpose

This document describes how to migrate the current **The Negotiator** prototype from the moving-company vertical to the **wedding-photographer** vertical.

The target experience is:

1. Emma describes her wedding by voice or uploads a wedding document.
2. The product creates one confirmed, immutable wedding-photography brief.
3. The Negotiator calls three consented human role-players who represent photography vendors.
4. Each live call produces an itemized, comparable quote and transcript.
5. The Negotiator cites a real collected quote to negotiate price or terms.
6. The report ranks offers with recordings, transcript evidence, red flags, and a recommendation.

This is a migration plan, not implementation. Existing application code remains unchanged until its tasks are performed.

---

## 1. Architecture Decision

### Use human-in-the-loop counterparties

Use challenge option 2 for the hackathon demo: real people answer genuine phone calls while role-playing different wedding-photography vendors.

This is preferable to scripted counter-agents because calls can include interruptions, questions, refusals, and price changes that happen in response to real agent behavior.

```text
Browser
  └─ ElevenLabs Intake Agent (voice intake)
       └─ confirmed WeddingPhotoJobSpec
            └─ Next.js caller orchestration
                 └─ ElevenLabs Negotiator Agent
                      └─ Twilio outbound call
                           └─ consented human participant's phone
                                └─ vendor role-play conversation
```

### Required live infrastructure

- One ElevenLabs Intake Agent.
- One ElevenLabs Negotiator Agent.
- One Twilio account and a Twilio-connected ElevenLabs phone number for outbound calls.
- Three consented participant phone numbers, ideally one participant per call when running in parallel.
- Recording consent from all human participants.

The prior plan for three ElevenLabs counter-agents is replaced by human role-players. The app should not display generated quotes or transcripts if a real conversation did not complete.

---

## 2. Homepage Migration (`src/app/page.tsx`)

### Replace moving positioning

Replace moving-specific copy with wedding-photography positioning:

```text
Headline: Your wedding deserves better than the first quote.

Subhead: Our AI calls photographers on your behalf, compares itemized packages,
flags hidden charges, and negotiates better value - in minutes.
```

### Add: “Why multiple quotes matter” section

Add this section after the hero and before the general workflow.

| Benefit | User-facing point | Suggested visual |
|---|---|---|
| Fair market price | Six comparable offers make an expensive outlier visible. | Quote distribution: $1,800 to $2,500 cluster; $4,500 outlier. |
| Suspiciously low offers | A $1,100 opening price may become $2,600 after travel, overtime, album, and drone fees. | Initial vs all-in fee breakdown. |
| Negotiating power | A verified $2,200 comparable quote can support a request for price matching or an added service. | Negotiation transcript and price/terms change. |

Suggested section headline:

```text
Three calls do more than save money.
They reveal the real offer.
```

### Add: “What Emma avoids” section

Show the customer’s repetitive work against what the agent does on her behalf.

| Emma would normally do | The Negotiator does instead |
|---|---|
| Search for photographers | Builds an approved vendor list |
| Repeat wedding details | Reuses one confirmed brief verbatim |
| Wait for calls and callbacks | Places and tracks calls |
| Write down package prices | Saves structured line items |
| Compare incompatible packages | Normalizes coverage and add-ons |
| Book the first reasonable option | Negotiates using verified bids |

Copy:

```text
Eight 15-minute calls can cost a couple roughly two hours. The Negotiator
handles the repetitive conversations while the couple keeps the final decision.
```

### Preserve global requirements

- Keep the fixed AI disclosure badge on every page.
- Keep the dark “War Room” visual language.
- Keep the primary CTA routing to `/intake`.

---

## 3. Replace Moving Types with Wedding Types (`src/lib/types.ts`)

### Replace `JobSpec`

Replace moving fields such as origin, bedrooms, stairs, and large items with a wedding-photography specification.

```ts
export interface WeddingEvent {
  name: string;
  date?: string;
  coverage_hours: number;
}

export interface WeddingVenue {
  name: string;
  city: string;
  address?: string;
}

export interface WeddingPhotoJobSpec {
  id: string;
  created_at: string;
  vertical: 'wedding_photography';
  wedding_date: string;
  venue: WeddingVenue;
  events: WeddingEvent[];
  guest_count: number;
  photography_required: boolean;
  videography_required: boolean;
  drone_coverage_required: boolean;
  cinematic_film_required: boolean;
  highlight_reel_required: boolean;
  albums_required: boolean;
  album_count: number;
  travel_required: boolean;
  overnight_stay_required: boolean;
  photography_styles: string[];
  special_requests: string[];
  intake_method: 'voice' | 'document' | 'combined';
  confirmed_by_user: boolean;
  confirmed_at: string;
  spec_hash: string;
}
```

### Replace moving quote line items

```ts
export interface WeddingPhotoQuoteDetails {
  base_coverage: number;
  additional_event_coverage: number;
  videography: number;
  drone_coverage: number;
  cinematic_film: number;
  highlight_reel: number;
  albums: number;
  travel: number;
  accommodation: number;
  taxes: number;
  deposit: number;
  overtime_rate_per_hour: number;
  other_fees: Array<{ name: string; amount: number }>;
  total: number;
  binding: boolean;
  valid_until: string;
}
```

Update `Quote` so its `quote` property uses `WeddingPhotoQuoteDetails`. Preserve existing call outcome, transcript, red-flag, price-change, and timestamp fields.

### Keep integrity types

The following concepts must remain unchanged:

- `ConversationTurn`
- `NegotiationResult`
- `ConversationState`
- `Report`
- `quote_received | callback_commitment | documented_decline`

The `spec_hash` must be sent with every call and shown in the UI as evidence that all vendors received the same requirements.

---

## 4. Vertical Configuration (`src/config/wedding-photography.json`)

Create a new config file. Do not hard-code vertical logic into components or prompts.

```json
{
  "vertical_name": "Wedding Photographers",
  "vertical_slug": "wedding_photography",
  "fee_taxonomy": [
    "base_coverage",
    "additional_event_coverage",
    "videography",
    "drone_coverage",
    "cinematic_film",
    "highlight_reel",
    "albums",
    "travel",
    "accommodation",
    "taxes",
    "deposit",
    "overtime_rate_per_hour"
  ],
  "red_flag_rules": [
    {
      "rule": "quote_below_market_threshold",
      "threshold_pct": 30,
      "message": "Suspiciously Low - Verify scope and hidden charges"
    },
    {
      "rule": "requested_event_missing",
      "message": "Incomplete Coverage - Requested event is not included"
    },
    {
      "rule": "non_binding",
      "message": "Non-Binding Risk - Final price may change"
    },
    {
      "rule": "missing_overtime_rate",
      "message": "Overtime Cost Unknown"
    },
    {
      "rule": "refused_itemization",
      "message": "Opaque Pricing - Avoid"
    }
  ],
  "negotiation_levers": [
    "competing_bid",
    "price_match",
    "complimentary_engagement_shoot",
    "complimentary_album",
    "drone_fee_waiver",
    "binding_total_request"
  ]
}
```

### Benchmark policy

Do not put invented benchmark amounts in this file. A benchmark needs a locality, date, public source, normalized scope, and calculated median.

Use this shape instead:

```ts
interface MarketBenchmark {
  city: string;
  collected_at: string;
  normalized_scope: string;
  source_count: number;
  market_median: number;
  low_threshold: number;
  high_threshold: number;
  sources: Array<{ vendor: string; url: string; published_price: number }>;
}
```

---

## 5. Intake Migration

### Voice interview (`src/components/intake/VoiceIntake.tsx`)

Update the ElevenLabs Intake Agent system prompt and UI copy.

The interviewer needs to collect:

1. Wedding date.
2. Venue name and city.
3. Events needing coverage: Haldi, Mehendi, Sangeet, ceremony, reception, etc.
4. Expected guest count.
5. Coverage hours for every event.
6. Photography-only or photography plus videography.
7. Drone coverage.
8. Cinematic film and highlight-reel preferences.
9. Albums and quantity.
10. Travel and overnight stay.
11. Photography style preferences.
12. Special requests.

The final response must contain a parseable `WEDDING_PHOTO_JOB_SPEC` payload and ask for verbal confirmation. The UI still requires on-screen confirmation before calls begin.

### Job confirmation (`src/components/intake/JobSpecConfirm.tsx`)

Replace all moving field labels with wedding fields.

Required visual sections:

```text
Wedding details
  Wedding date
  Venue
  Expected guests

Coverage plan
  Events and hours
  Photography / videography
  Drone / films / albums

Logistics and style
  Travel / overnight stay
  Desired photography styles
  Special requests
```

The confirmation button must lock the exact object in localStorage. After confirmation, any edit requires an explicit “unlock and revise” action that invalidates unfinished quote calls.

---

## 6. Non-AI Document Parsing

### Requirement

Do not use Anthropic for document parsing in this vertical.

Support at least these document types:

- Wedding invitation PDF or PNG.
- Existing photographer quote PDF.

### Recommended parser service

The existing Next.js server can call a small Python parser service. This avoids trying to run Python document tools directly in a Vercel route.

```text
Next.js upload route
  ↓
Python document-parser service
  ├─ PyMuPDF: extract text from PDF
  ├─ pdfplumber: extract tables / fallback text
  ├─ Tesseract OCR: extract text from PNG or scanned content
  └─ deterministic field mapper
  ↓
Partial WeddingPhotoJobSpec + extraction confidence + source evidence
```

### Parser behavior

Use deterministic extraction and regular expressions rather than an LLM:

- Date patterns -> `wedding_date`
- Labels such as `Venue`, `Location`, `City` -> venue fields
- Event names such as `Haldi`, `Mehendi`, `Sangeet`, `Reception` -> event array
- Labels such as `Drone`, `Album`, `Cinematic`, `Hours`, `Travel` -> quote/coverage fields
- Currency patterns -> quote line items

Return unknown fields as `null` or empty arrays. Highlight them in amber in the confirmation view. The voice interviewer can collect missing fields.

### Route changes

Replace the current Anthropic-backed `POST /api/intake/parse-document` implementation with a proxy to the parser service.

Suggested response:

```ts
{
  success: true,
  job_spec: Partial<WeddingPhotoJobSpec>,
  confidence: 'high' | 'medium' | 'low',
  missing_fields: string[],
  extraction_evidence: Array<{
    field: string;
    source_text: string;
    page?: number;
  }>
}
```

---

## 7. Live Human-in-the-Loop Calls

### Replace counter-agent orchestration

Remove the assumption that the application starts conversations with three counter-agent IDs.

Instead, maintain an approved participant list:

```ts
interface DemoVendorParticipant {
  id: string;
  vendor_name: string;
  vendor_style: 'premium_negotiable' | 'lowball_upseller' | 'transparent_fair';
  phone_number: string;
  consent_recording: boolean;
}
```

Only send calls to numbers explicitly entered and approved for the demo.

### Required environment variables

```bash
ELEVENLABS_API_KEY=xi_...
ELEVENLABS_INTAKE_AGENT_ID=...
ELEVENLABS_NEGOTIATOR_AGENT_ID=...
ELEVENLABS_OUTBOUND_PHONE_NUMBER_ID=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
NEXT_PUBLIC_ELEVENLABS_INTAKE_AGENT_ID=...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

The human participant numbers should be demo data entered in the dashboard or stored locally for the session. Do not commit personal phone numbers.

### Call lifecycle

```text
User confirms spec
  ↓
User approves three consented demo vendors
  ↓
POST /api/calls/initiate for each vendor
  ↓
ElevenLabs Negotiator Agent places Twilio outbound call
  ↓
Dashboard receives Twilio/ElevenLabs status events
  ↓
Conversation transcript and recording become available
  ↓
Quote extractor validates the conversation result
  ↓
Call card becomes Complete, Declined, or Callback Committed
```

### API changes

Update `POST /api/calls/initiate` to accept a human phone target:

```ts
{
  vendor: DemoVendorParticipant,
  job_spec: WeddingPhotoJobSpec,
  mode: 'quote' | 'negotiate',
  leverage?: {
    company_name: string;
    amount: number;
    binding: boolean;
  }
}
```

The route must:

1. Validate `confirmed_by_user` and the immutable `spec_hash`.
2. Validate participant recording consent.
3. Create an in-memory `ConversationState`.
4. Start the outbound call through the configured provider.
5. Return immediately with a call identifier.
6. Never create a synthetic quote or transcript if calling fails.

### Webhooks

Add provider webhook routes for call status and recording availability. Verify Twilio webhook signatures before accepting an event.

Possible route layout:

```text
/api/webhooks/twilio/voice
/api/webhooks/twilio/recording
/api/calls/[id]/status
/api/calls/[id]/transcript
```

---

## 8. Human Role Cards

Give each human participant a private behavioral brief. Do not provide a word-for-word script.

### A. Premium Frame Studios - premium, negotiable

Purpose: likely negotiation target.

- Starts higher than a comparable transparent quote.
- Gives an itemized package.
- Can negotiate price or offer an inclusion when real leverage is presented.
- May challenge whether a competing package has equivalent scope.

Decision rule:

```text
Comparable verified offer within 10-15%:
  reduce price by 5-10%, or include an engagement shoot / album.

Offer far below cost:
  hold firm or make a smaller value-add offer.

No real verified quote:
  do not change price because of a claimed bid.
```

### B. FlashDeal Photography - lowball and upsell

Purpose: demonstrate hidden-fee and suspicious-low-price detection.

- Opens with a low price.
- Reveals travel, extra-hour, drone, album, second-shooter, or peak-date fees only when asked.
- Defaults to a non-binding estimate.
- Can offer a higher binding amount if pushed.

### C. Honest Lens Collective - transparent fair dealer

Purpose: set the reliable benchmark and likely recommendation.

- Gives itemized total and exclusions proactively.
- States binding terms, deposit, overtime, travel, and delivery timeline.
- May be slightly more expensive than the lowball vendor but safer and more comparable.

### Participant instructions

Participants should be allowed to:

- Interrupt the agent.
- Ask clarifying questions.
- Say they are busy or propose a callback.
- Question whether another quote is comparable.
- Refuse to reduce price if leverage is weak.
- Change terms only because the agent presented a verified quote.

This produces a genuine negotiation rather than a screenplay.

---

## 9. Negotiator Prompt and Tool Changes

### Prompt requirements

The Negotiator Agent must:

- Introduce itself as an AI assistant calling for the customer.
- Disclose its identity honestly if asked.
- Read only the confirmed wedding brief.
- Ask every vendor for an itemized, all-in quote.
- Ask about requested events, coverage hours, travel, overtime, albums, drone, video, deposit, and binding terms.
- Never invent a quote, package, or comparison.
- End every call with a structured outcome.

### Required structured tools

Expose server-controlled tools rather than allowing the model to save arbitrary claims:

```text
get_confirmed_wedding_spec()
save_quote_line_item(name, amount)
set_quote_term(name, value)
set_call_outcome(outcome)
get_verified_competing_quote()
request_callback(timeframe)
```

`get_verified_competing_quote()` must return only quotes collected during the active session and validated as comparable.

---

## 10. Caller UI Migration (`src/app/calls` and `src/components/calls`)

### Call cards

Replace moving fee labels with wedding quote labels:

```text
Base event coverage
Additional event coverage
Videography
Drone coverage
Cinematic film
Albums
Travel / accommodation
Taxes
Deposit
Overtime rate
All-in known total
```

### Status requirements

Every card must show exactly one clearly visible result:

- `CALLING`
- `QUOTE RECEIVED`
- `CALLBACK COMMITMENT`
- `DECLINED TO QUOTE`
- `CALL FAILED`

Never show a price when no quote was actually collected.

### Call list / market-discovery panel

Add a visible panel explaining where real production vendors would come from:

```text
Search: Wedding photographers near [venue city]
Source: Google Places / Yelp / approved local directory
Filters: phone number, rating, review count, opening hours, distance
```

For the hackathon, clearly label human targets as:

```text
Live demo participant - consented role-play vendor
```

---

## 11. Negotiation Strategy (`/api/negotiate`)

### Valid leverage selection

1. Keep only `quote_received` outcomes.
2. Exclude quotes that are more than 30% below the local benchmark or peer median unless scope is verified.
3. Exclude incomplete packages that omit requested coverage.
4. Select the lowest valid comparable quote as leverage.
5. Target a higher-priced comparable vendor.
6. Ask for a price reduction or one measurable included extra.

Example strategy response:

```ts
{
  target_company: 'Premium Frame Studios',
  leverage_company: 'Honest Lens Collective',
  leverage_amount: 2200,
  leverage_binding: true,
  approach: 'Use the verified binding $2,200 package to request either a price match or a complimentary engagement shoot and album.'
}
```

### Accepted live outcomes

```text
Price reduced:
  $2,800 -> $2,450

Terms improved:
  $2,800 unchanged
  + complimentary engagement shoot
  + album included

Held firm:
  Preserve the refusal and explain why another vendor is recommended.
```

Terms changes must be normalized to their monetary and scope impact in the final report.

---

## 12. Report Migration (`/api/report/generate` and `/report`)

The final report must include:

1. Confirmed wedding brief and `spec_hash`.
2. Ranked comparable quotes.
3. Itemized package comparison.
4. Red flags and unresolved costs.
5. Initial versus negotiated offer.
6. Call recording links and complete transcripts.
7. Plain-language recommendation.

### Ranking policy

Rank based on transparent all-in value, not the lowest opening price.

Signals that should improve ranking:

- All requested events are included.
- Required photo/video/drone/albums are included or clearly priced.
- Binding price or clear written confirmation.
- Travel and overtime policies are known.
- No suspiciously low all-in total.
- Clear transcript evidence.

Signals that should reduce ranking:

- Missing requested events or services.
- Undisclosed fees.
- Non-binding estimate.
- Price well below benchmark without verification.
- Refusal to itemize.

### Recommendation example

```text
Recommend Honest Lens Collective at $2,200 binding.

Their quote covers all requested events, two photographers, drone coverage,
and edited delivery with no unresolved travel or overtime costs. FlashDeal's
$1,100 opening price became materially less competitive once required add-ons
were itemized. Premium Frame reduced its price but remained above the verified
binding offer.
```

Every factual statement must cite an actual transcript turn or structured call result.

---

## 13. Market Discovery and Benchmark Workflow

### Production discovery

```text
Venue city + wedding date + service category
  ↓
Google Places or Yelp Fusion search
  ↓
Candidate list: name, phone, website, ratings, reviews, operating hours
  ↓
User approves selected vendors
  ↓
AI calls only approved vendors
```

### Benchmark collection

For a simulation, demonstrate the workflow but do not claim simulated vendor prices are live market data.

For real benchmarks:

1. Pick a city and a normalized wedding scope.
2. Collect published packages or rate cards from local vendor websites and wedding directories.
3. Save source URL, collection date, price, and included scope.
4. Normalize quotes to event count, coverage hours, photo/video, drone, and album requirements.
5. Calculate median and red-flag threshold.
6. Display benchmark provenance in the report.

Suggested UI label:

```text
Benchmark: public local package data, normalized for this wedding brief.
It is a comparison aid, not a guaranteed market price.
```

---

## 14. Implementation Order

Perform this migration in order:

1. Update shared TypeScript types and wedding config.
2. Update landing-page copy and the three-benefits section.
3. Update Intake Agent prompt and intake/confirmation UI.
4. Create the Python PDF/PNG parser service and replace the current document route.
5. Update call cards and quote normalization fields.
6. Configure ElevenLabs/Twilio outbound calling.
7. Replace counter-agent IDs with consented human participant configuration.
8. Implement verified quote extraction and call-status/transcript retrieval.
9. Implement valid-leverage negotiation strategy.
10. Update report/ranking logic and evidence display.
11. Rehearse with three role-players and record golden calls.
12. Run the complete judge demo on the deployed application.

---

## 15. Definition of Done

- [ ] Homepage clearly explains outlier detection, suspicious-low-offer detection, and negotiating leverage.
- [ ] Voice and PDF/PNG paths create the same `WeddingPhotoJobSpec`.
- [ ] User confirms one immutable wedding brief before calling.
- [ ] Three live consented human role-players answer calls with distinct negotiation behaviors.
- [ ] Each completed call has an itemized quote, transcript, recording, and explicit outcome.
- [ ] At least one negotiation changes price or measurable terms using a verified in-session competing quote.
- [ ] No agent invents inventory, prices, offers, or binding status.
- [ ] “Are you a robot?” is handled honestly.
- [ ] Report ranks vendors by comparable all-in value and cites transcript evidence.
