# The Negotiator

The Negotiator is a Hack-Nation × ElevenLabs MVP that helps couples compare wedding-photography quotes. A customer creates and confirms one wedding brief; the app reuses that exact brief when it calls consented demo participants, captures itemized quote data, and surfaces the evidence needed for a comparison and negotiation.

This repository is currently a wedding-photography prototype. The earlier moving-company version has been replaced in the active application.

## Current capabilities

- Voice intake through an ElevenLabs conversational agent.
- Document intake for wedding invitations and existing photographer quotes:
  - PNG images are processed with Tesseract OCR.
  - PDFs are parsed by `scripts/document_parser.py`.
- A user-reviewable, immutable wedding brief. Confirmation adds a timestamp and hash before any call can be started.
- A three-vendor call batch using consented human role-player phone numbers.
- ElevenLabs outbound-call initiation with the locked brief and call ID supplied as dynamic variables.
- Webhook handling that turns an ElevenLabs post-call transcript and data-collection result into a structured quote.
- In-browser quote display, including itemized fees, binding status, red flags, and expandable transcript text.
- Server-side selection of a negotiation strategy from at least two valid completed quotes.
- An Anthropic-backed report-generation API that accepts completed quotes and a negotiation result.

## Workflow

1. **Create a brief** at `/intake` by voice or document upload.
2. **Review and confirm** the wedding date, venue, events, coverage type, drone and album requirements, and special requests. The confirmed object is locked with a `spec_hash`.
3. **Call participants** at `/calls`. Enter three consented role-player numbers and start the batch. Every call gets the same confirmed brief.
4. **Compare verified quotes.** Quotes are shown only after the post-call webhook has provided an outcome, transcript, and structured data.
5. **Prepare negotiation.** `POST /api/negotiate` selects a verified competing quote as leverage when at least two comparable quotes are available.
6. **Generate a report** through `POST /api/report/generate` after a negotiation result is available.

## Current limitations

- Calls use real outbound dialing to consented human demo participants; this is not a directory search or live market-pricing service.
- Call state is held in an in-memory server `Map`, so it is lost on a server restart and is not suitable for a multi-instance deployment.
- Browser workflow state is stored in `localStorage`; there is no database or user authentication.
- The negotiation page currently displays saved negotiation evidence only. The UI does not yet trigger a follow-up negotiation call or save its result.
- The report page is a readiness screen. Although its API is implemented, the UI does not yet call it or render the generated report.
- Document uploads currently accept only PDF and PNG. OCR/parser results should be reviewed and corrected in the confirmation form.
- The ElevenLabs webhook endpoint currently does not verify webhook signatures; add verification before any production use.

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Product landing page and workflow overview. |
| `/intake` | Voice and document intake plus brief confirmation. |
| `/calls` | Configure consented participants, initiate quote calls, and review results. |
| `/negotiate` | Shows saved negotiation evidence; full negotiation execution is pending. |
| `/report` | Readiness screen for a report; report rendering is pending. |

## API endpoints

| Endpoint | Description |
| --- | --- |
| `POST /api/intake/parse-document` | Parses a PDF or PNG into a partial wedding brief and returns missing fields and extraction evidence. |
| `POST /api/calls/initiate` | Validates a confirmed brief and starts an ElevenLabs outbound quote or negotiation call. |
| `GET /api/calls/:id/status` | Returns the in-memory status, quote, and transcript for a call. |
| `POST /api/webhooks/elevenlabs` | Receives a post-call transcription event and records the structured quote. |
| `POST /api/negotiate` | Selects a negotiation strategy from valid completed quotes. |
| `POST /api/report/generate` | Produces an evidence-backed report with Anthropic. |

## Local setup

Requirements: Node.js 18.17+ (or a compatible version for Next.js 14), npm, and Python available as `python` for PDF parsing.

```bash
copy .env.local.example .env.local
npm install
npm run dev
```

Open `http://localhost:3000`.

Use `npm run build` to create a production build. The repository's `lint` script currently calls the legacy `next lint` command and may require updating for the installed Next.js version.

## Environment variables

Copy `.env.local.example` and supply the values needed for the features you use:

| Variable | Used for |
| --- | --- |
| `ELEVENLABS_API_KEY` | Server-side ElevenLabs API access. |
| `ELEVENLABS_INTAKE_AGENT_ID` | Intake agent configuration. |
| `NEXT_PUBLIC_ELEVENLABS_INTAKE_AGENT_ID` | Browser-accessible intake agent ID for the voice widget. |
| `ELEVENLABS_NEGOTIATOR_AGENT_ID` | Agent used for outbound quote and negotiation calls. |
| `ELEVENLABS_OUTBOUND_PHONE_NUMBER_ID` | ElevenLabs/Twilio outbound phone-number ID. |
| `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` | Included in the example configuration for the dialing setup. |
| `ANTHROPIC_API_KEY` | Server-side report generation. |
| `NEXT_PUBLIC_APP_URL` | Public application URL; defaults to the local development URL in the example. |

## Project structure

```text
src/app/                     Pages and Next.js route handlers
src/components/              Intake, call, and shared UI components
src/lib/                     Types, call store, ElevenLabs, negotiation, and report helpers
src/config/                  Wedding-photography fee taxonomy and red-flag rules
scripts/document_parser.py   PDF text extraction and wedding-brief mapping
docs/                        Migration notes and ElevenLabs agent setup guidance
```

## Demo and safety notes

- Obtain participant consent, including recording consent, before entering a phone number and placing a call.
- The app requires a confirmed brief before initiating calls and does not fabricate quotes, prices, or transcripts.
- Treat the output as comparison support, not a booking or legal commitment. Verify package terms, availability, tax, travel, deposits, and cancellation policies directly with the vendor.

For agent prompts and the data-collection setup, see [the ElevenLabs setup guide](docs/ELEVENLABS_WEDDING_SETUP.md). The migration plan and remaining implementation checklist are in [the wedding-photography migration document](docs/WEDDING_PHOTOGRAPHY_MIGRATION.md).
