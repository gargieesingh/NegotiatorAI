# General-Purpose Negotiator — Implementation Plan

## 1. Product decision

The Negotiator should be a **general quote-shopping engine**, not a collection of hard-coded verticals. A user can describe any phone-priced need (moving, wedding photography, auto repair, contractor work, equipment rental, medical-bill review) and the application builds a quote-ready specification for that specific job.

The current wedding-photography flow remains the **hackathon proof vertical**. It must continue to run end to end because the challenge rewards a complete, trustworthy loop more than broad but shallow support. The general-purpose layer should make adding the next vertical a configuration task, not an agent or UI rewrite.

### Critical design rule

Do **not** let the LLM edit repository JSON files at runtime. That would make a customer session change product behavior for later customers, create security and reproducibility problems, and make quotes difficult to audit.

Instead, OpenAI generates a **vertical configuration proposal** stored as versioned data for the current job. The backend validates it against a fixed `VerticalConfig` schema. The user confirms the generated job brief, and every later call stores the exact `config_version` and `job_spec_hash` used. Curated configs, such as `wedding_photography`, can later be promoted into the reusable vertical registry after review.

```text
Customer description + documents
            ↓
OpenAI: classify vertical + propose job-spec taxonomy
            ↓
Backend schema/policy validation
            ↓
Versioned VerticalConfig for this job
            ↓
Voice/document intake → confirmed immutable JobSpec
            ↓
Discovery → calls → normalized quotes → negotiation → report
```

## 2. What is configuration vs. code

| Belongs in versioned vertical configuration | Belongs in product code |
|---|---|
| Job-spec fields and validation rules | Authentication, persistence, rate limiting, audit logging |
| Quote line items and comparison units | Voice session lifecycle and telephony integration |
| Google Places search categories/query templates | JSON Schema validation and OpenAI API integration |
| Benchmark sources and red-flag thresholds | Quote arithmetic, evidence storage, user confirmation flow |
| Negotiation levers and allowed asks | Honesty guardrails: never fabricate bids or inventory |
| Vertical-specific interviewer/caller instructions | Shared pages, UI renderer, webhook processing |

This distinction satisfies “configuration, not code” without allowing arbitrary untrusted behavior.

## 3. Canonical data model

Every job uses the same outer envelope. Only `job_spec` and `quote_schema` vary by vertical.

```ts
type NegotiationJob = {
  id: string;
  customer_id: string;
  lifecycle: 'draft' | 'intake_confirmed' | 'discovering' | 'calling' | 'comparing' | 'negotiating' | 'reported';
  vertical_config: VerticalConfig;
  config_version: string;
  job_spec: Record<string, unknown>;
  job_spec_hash: string;
  intake_evidence: Evidence[];
  confirmed_at?: string;
};

type VerticalConfig = {
  id: string;                         // e.g. wedding_photography
  display_name: string;
  classification_confidence: number;
  job_spec_schema: JsonSchema;
  quote_schema: JsonSchema;
  required_intake_fields: string[];
  discovery: {
    google_places_queries: string[];
    location_field: string;
    target_vendor_count: number;      // normally 10
    category: string;
  };
  comparison: {
    currency: string;
    total_field: string;
    normalized_units: string[];
    required_quote_fields: string[];
  };
  red_flag_rules: RedFlagRule[];
  negotiation_rules: NegotiationRule[];
  prompts: {
    estimator_instructions: string;
    caller_instructions: string;
    closer_instructions: string;
  };
};
```

An `Evidence` record includes a source (`voice`, `pdf`, `png`, `vendor_transcript`), exact text/page/turn, timestamp, and the field it supports. This lets the report prove why a value is present.

### Example generated configuration: auto body repair

```json
{
  "id": "auto_body_repair",
  "display_name": "Auto body repair",
  "required_intake_fields": [
    "vehicle_year_make_model",
    "damage_description",
    "damage_photos",
    "repair_location",
    "insurance_status",
    "desired_completion_window"
  ],
  "comparison": {
    "currency": "USD",
    "total_field": "estimated_total",
    "normalized_units": ["parts", "labor_hours", "paint_materials", "tax"],
    "required_quote_fields": ["parts", "labor", "paint", "tax", "estimated_total", "estimate_binding_status"]
  },
  "red_flag_rules": [
    {"id": "low_outlier", "condition": "total < 0.70 * median", "severity": "warning"},
    {"id": "missing_labor_hours", "condition": "labor_hours missing", "severity": "warning"}
  ]
}
```

The same renderer that shows wedding event coverage then shows vehicle details, damage, parts, labor, and paint details for this job.

## 4. End-to-end customer flow

### Stage 0 — Describe the need and choose a vertical

1. The landing page asks the customer: “What would you like us to price-shop?”
2. They can type a short description, choose a suggested vertical, upload a PDF/PNG, or start voice intake.
3. The backend sends the initial description and extracted document text to OpenAI.
4. OpenAI returns structured output containing:
   - candidate vertical ID and display name;
   - confidence and a short customer-facing explanation;
   - a minimum job-spec schema;
   - quote-line-item schema;
   - discovery query templates;
   - conservative red-flag and negotiation rules.
5. The backend rejects unsafe or invalid fields/rules, limits configuration size, and either selects an existing approved config or creates a job-scoped candidate config.
6. The UI shows: “We identified this as wedding photography / moving / auto repair. Is that correct?” The user can correct the vertical before intake starts.

The OpenAI call must use strict structured output / JSON Schema, not free-form JSON parsing. Strict schemas make the model output conform to the expected envelope; the backend must still validate business rules and never trust model output by itself. [OpenAI Structured Outputs reference](https://platform.openai.com/docs/api-reference/evals/deleteRun?lang=python)

### Stage 1 — Estimator: voice and document intake converge on one JobSpec

**Voice path**

1. Start one ElevenLabs Estimator agent with dynamic variables for `vertical_config`, current `job_spec`, and missing required fields.
2. The agent introduces itself honestly as the customer’s authorized AI assistant.
3. It asks one or two expert-estimator questions at a time, following the configured required fields.
4. It handles ambiguity by asking clarifying questions, not guessing.
5. On completion it calls the browser client tool `submit_job_spec`; it does not speak JSON aloud.
6. The app validates and stores the result, then renders a dynamic confirmation form at the bottom of `/intake`.

**Document path**

1. PDF files are text-extracted with PyMuPDF/pdfplumber. PNG files are OCR’d with Tesseract.
2. Store raw text and page/source evidence.
3. Send the extracted text plus the selected `VerticalConfig` to OpenAI to map it to the same `job_spec_schema`.
4. Never silently fill a missing required field. Mark it “Needs confirmation.”

**Confirmation gate**

The customer can edit every field. Clicking **Confirm and search vendors** freezes a canonical JSON object and computes `job_spec_hash`. All call attempts receive this exact JSON and hash. Any later change creates a new version and invalidates prior quote comparability.

### Stage 2 — Market discovery: show where the list came from

1. Build Google Places queries from `vertical_config.discovery.google_places_queries` and the confirmed location.
2. Ask Google Places for up to 10 businesses.
3. Store and display each business’s `place_id`, name, business phone number, address, rating, Maps source link, and query used.
4. De-duplicate results and exclude businesses with no callable phone number.
5. The customer chooses three vendors to contact, or the system proposes a diverse set while the customer approves it.
6. Show this list before any call is made.

Google Places supplies business contact data, not guaranteed mobile numbers. The product should label them “business phone numbers” and respect provider terms, local calling laws, opt-out requests, opening hours, and customer authorization.

For the hackathon demo, show the real discovery list but call only three **consenting human role-players**. This preserves the live-call requirement while avoiding unsolicited demo calls to real businesses.

### Stage 3 — Caller: three parallel, consistent calls

1. The browser submits the three approved vendors and immutable job spec to `/api/calls/initiate` concurrently.
2. The server starts three ElevenLabs/Twilio outbound sessions in parallel.
3. Each session receives dynamic variables:
   - confirmed `job_spec` verbatim;
   - `config_version` and `job_spec_hash`;
   - vendor identity and call ID;
   - allowed questions and required quote fields;
   - no competing bid during first-round collection.
4. The agent discloses it is an AI assistant if asked, never claims to be the customer, and says it is gathering comparable information on the customer’s behalf.
5. It survives friction: brief answers, interruptions, callbacks, refusal to quote, “Are you a robot?”, and no response.
6. Each call ends only as `quote_received`, `callback_commitment`, or `documented_decline`.
7. It thanks the vendor, says it will share the information with its customer, then uses the End Call tool. It never reads JSON or analysis data aloud.

### Stage 4 — Normalize transcripts into itemized quotes

ElevenLabs sends a post-call transcription webhook after the call is complete. The backend stores the raw transcript/recording metadata, then calls OpenAI with:

```text
Immutable vertical quote schema + confirmed job spec + transcript
→ normalized quote + evidence turn IDs + missing fields + outcome
```

The response is validated against the current `quote_schema`. Every line item must contain its quoted amount, `0`, or `unknown`; no estimated value may be fabricated.

This transcript-to-schema step is more general than configuring fixed ElevenLabs Analysis fields for every possible vertical. ElevenLabs remains responsible for reliable conversational calling and transcripts; OpenAI maps each transcript into the dynamic vertical schema.

### Stage 5 — Compare and detect red flags

Comparison arithmetic is deterministic code, not LLM judgement:

1. Require each vendor quote to cover the same required scope.
2. Calculate normalized total, known exclusions, missing data, and price range.
3. Use the configured benchmark/rules. For example, a quote 30%+ below the median is a warning, not an automatic winner.
4. Display a comparison table, fee breakdown, transcript links, recording links, and evidence for each conclusion.
5. Ask the customer which vendor may be contacted for negotiation.

The LLM may explain the comparison in plain language, but only from stored quote values and evidence spans.

### Stage 6 — Closer: evidence-backed negotiation

1. Select a target vendor and a real, eligible comparison quote.
2. Generate a negotiation plan from configuration:
   - exact quote amount/vendor that may be cited;
   - allowed request: price match, fee removal, better payment terms, or an included extra;
   - prohibited claims.
3. Obtain customer approval before placing the negotiation call.
4. Call the target vendor using the same job spec and only the verified leverage quote.
5. Ask for a measurable change. Example: “I have an itemized, binding quote for $1,850 for the same scope. Could you beat that total, waive travel, or include the album?”
6. Store initial and final price/terms plus transcript evidence.

The system must never invent a competitor, quote, binding status, availability, damage, inventory, or customer requirement.

### Stage 7 — Report

The final report ranks vendors using deterministic criteria from the current configuration:

- comparable all-in price;
- requested scope covered;
- binding/validity status;
- red flags and unknown fees;
- verified negotiated change;
- transcript and recording evidence.

The report clearly distinguishes an itemized quote, a callback commitment, and a decline. A plain-language recommendation links every material claim to a call turn or source document.

## 5. Architecture

```text
Next.js / Vercel application
│
├── UI
│   ├── dynamic intake confirmation renderer
│   ├── vendor discovery list and approval
│   ├── live call status / itemized quote cards
│   └── comparison, negotiation, evidence report
│
├── API and orchestration
│   ├── OpenAI vertical/config proposal service
│   ├── JobSpec validation and versioning
│   ├── Google Places discovery service
│   ├── ElevenLabs/Twilio outbound-call service
│   ├── ElevenLabs post-call webhook handler
│   ├── transcript → normalized-quote extraction service
│   └── comparison / negotiation strategy service
│
├── Persistent database (required on Vercel)
│   ├── jobs and config versions
│   ├── documents/evidence
│   ├── discovered vendors
│   ├── calls, transcripts, recordings metadata
│   ├── normalized quotes and negotiation results
│   └── audit events
│
└── External services
    ├── OpenAI API — classification, schema proposal, extraction, explanation
    ├── ElevenLabs Agents — estimator/caller/closer voice conversations
    ├── Twilio — outbound telephony used by ElevenLabs
    ├── Google Places API — vendor discovery
    └── Supabase Postgres / Vercel Postgres — durable state
```

## 6. OpenAI layer: safe responsibilities

| Task | Input | Strict output | Code validates |
|---|---|---|---|
| Vertical classification | Customer description/document text | vertical, confidence, reason | supported category, confidence threshold |
| Config proposal | Candidate vertical + user context | `VerticalConfig` candidate | allowed field types, prompt size, formula whitelist |
| Document normalization | Extracted raw text + config | partial JobSpec + evidence | JSON Schema, evidence exists |
| Transcript normalization | transcript + JobSpec + quote schema | normalized Quote + turn evidence | line items, numeric ranges, cited turn IDs |
| Report explanation | ranked deterministic results | explanation/recommendation | no unsupported claims |

OpenAI must not make outbound calls, choose vendors without approval, authorize payment, or change a confirmed job spec. Use the server-side Responses API and Structured Outputs. Never place `OPENAI_API_KEY` in browser code. OpenAI recommends the Responses API for multi-turn/tool workflows and strict output schemas for bounded structured outputs. [OpenAI model guidance](https://developers.openai.com/api/docs/guides/latest-model)

## 7. API routes to add or replace

```text
POST /api/jobs/classify-vertical
POST /api/jobs/:id/configure
POST /api/jobs/:id/intake/normalize-document
POST /api/jobs/:id/intake/submit-voice
POST /api/jobs/:id/confirm
POST /api/jobs/:id/discovery/search
POST /api/jobs/:id/vendors/select
POST /api/jobs/:id/calls/batch
POST /api/webhooks/elevenlabs
POST /api/jobs/:id/quotes/normalize
POST /api/jobs/:id/negotiate/plan
POST /api/jobs/:id/negotiate/start
GET  /api/jobs/:id/report
```

All write routes require the authenticated owner and append an audit event. Webhook handling verifies the ElevenLabs signature, deduplicates by conversation ID, stores the raw payload first, and processes extraction asynchronously/retryably.

## 8. Frontend changes

1. Replace wedding-only landing copy with “Tell us what you need priced.” Keep wedding photography as a selectable demo card.
2. Add a **vertical identification** step with the LLM’s suggestion and a user correction control.
3. Replace fixed `JobSpecConfirm` fields with a schema-driven form renderer supporting string, number, boolean, enum, array, object, and evidence/missing markers.
4. Add a discovery page that visibly shows the 10 Google Places results, their source links, and the selected three.
5. Make call cards read their line items from dynamic `quote_schema`, rather than wedding-specific fields.
6. Make comparison, red flags, negotiation plan, and report schema-driven.
7. Retain the existing wedding flow as an approved configuration and regression demo.

## 9. Deployment and persistence

Deploy the single Next.js application to Vercel: frontend pages and API routes live in one deployment. Do not split frontend and backend for this prototype.

Because Vercel functions are stateless, replace the current in-memory `callStore` with Postgres before using deployed webhooks. Store a durable internal call ID in ElevenLabs dynamic variables; the post-call webhook uses it to update the correct database record. Configure the webhook as:

```text
https://YOUR-VERCEL-DOMAIN/api/webhooks/elevenlabs
```

Server-only environment variables include `OPENAI_API_KEY`, `ELEVENLABS_API_KEY`, `GOOGLE_MAPS_API_KEY`, Twilio credentials, database URL, and ElevenLabs webhook secret. No secret is sent to the browser.

## 10. Recommended implementation order

### Phase A — Preserve the proof vertical

- Keep wedding photography working end to end.
- Move current types and rules behind a `VerticalConfig` adapter.
- Add regression fixtures for wedding intake, quotes, and negotiation transcript.

### Phase B — Generalize the data and UI layer

- Introduce database tables and `VerticalConfig` versions.
- Build dynamic JobSpec and quote renderers.
- Add hash/version/evidence handling.

### Phase C — Add OpenAI configuration proposal

- Add classification route and strict schema output.
- Add config allowlist/validator and user correction screen.
- Start with a small supported set: wedding photography, moving, auto repair, contractor bids.

### Phase D — Add discovery and durable call processing

- Integrate Google Places with query/evidence display.
- Add vendor selection/approval.
- Replace in-memory calls with database state.
- Add signed ElevenLabs webhook ingestion and transcript normalization.

### Phase E — Demonstrate the closed loop

- Run three distinct role-playing vendors live in one chosen vertical.
- Show one price/term change caused by a verified competitor quote.
- Generate ranked recommendation with quote, fee, transcript, and recording evidence.

## 11. Risks and guardrails

| Risk | Control |
|---|---|
| LLM proposes an irrelevant or unsafe taxonomy | JSON Schema, allowlisted field types/rules, user vertical confirmation |
| Incomplete intake leads to bad comparison | Required-field gate and explicit “unknown” values; never invent defaults |
| Quotes are not comparable | Scope coverage checker before ranking; show exclusions prominently |
| Fake leverage / dishonest negotiation | Leverage object is selected from stored verified quotes only |
| Calling real businesses without authorization | Show list first; customer approval; use consented role-players in demo |
| Telephony/webhook retries | Idempotency keys, persistent call state, signed webhook verification |
| Vercel stateless functions lose state | Postgres-backed jobs/calls/quotes, never an in-memory Map |
| Over-generalization weakens demo | Maintain one polished, proven vertical as the judged walkthrough |

## 12. Demo narrative for judges

1. “A customer needs a quote but does not know which vertical taxonomy applies.”
2. Show the app identify the vertical and propose a quote-ready intake structure.
3. Show voice/document evidence converge into one customer-confirmed JSON brief.
4. Show the 10 discovered real market businesses and their source data.
5. Call three consented role-players in parallel using the exact same locked brief.
6. Play a live negotiation where the agent cites a genuine captured quote and obtains a measurable change.
7. Show the final ranking, itemized comparison, red flags, recording/transcript evidence, and human-readable recommendation.

The strongest story is not “our AI can talk about any market.” It is: **“Our core is general, but every recommendation is grounded in a customer-confirmed scope, disclosed calls, real evidence, and a configuration that can be audited.”**
