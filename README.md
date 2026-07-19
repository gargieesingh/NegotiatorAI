# The Negotiator

Hack-Nation x ElevenLabs hackathon MVP for collecting comparable moving quotes and negotiating with verified competing bids.

## How the site works

The app is a four-step site flow:

1. **Start at the home page**
   - The landing page explains the service and directs users to the intake workflow.

2. **Intake: Build a quote-ready move scope**
   - Users can choose voice intake or document upload.
   - Voice intake opens a live audio session with an estimator agent. The estimator listens to your description and extracts a structured move specification.
   - Document upload accepts an uploaded image and extracts the same type of move details from an existing quote or inventory document.
   - Both intake routes populate the same job specification fields.
   - The user must review and confirm the final move scope before the app proceeds.

3. **Gathering quotes**
   - Once the move spec is confirmed, it is saved to `localStorage` and the app routes to the calls page.
   - The calls page creates a separate quote request for each simulated company.
   - Each live call uses the confirmed scope exactly as provided by the user.
   - The app only shows quotes once a verified live conversation returns a result.
   - This prototype does not persist call history in a database; all quote data is stored locally in the browser.

4. **Negotiation**
   - After at least two verified itemized quotes exist, the negotiation page becomes available.
   - The system selects one exact verified quote as leverage against another target company.
   - The negotiation result is stored in `localStorage` and used as evidence for the final report.

5. **Report generation**
   - The report page is only ready when the confirmed move spec, quotes, and negotiation result are all present.
   - A server-side report generator can analyze those results and produce an evidence-backed summary.

## What users input on the site

The app collects a complete moving job specification that typically includes:

- Origin city and state
- Destination city and state
- Distance in miles
- Number of bedrooms
- Large items to move
- Move date
- Estimated weight in pounds
- Special or fragile items
- Stairs/elevator details for origin and destination

Input can be provided in either of two ways:

- **Voice intake**: speak naturally to the estimator agent while the app records transcript lines and extracts the move fields.
- **Document upload**: upload an image quote or moving document and let the app parse the move details.

## Site route behavior

- `/` - Home page. Introduces the service and links to the intake page.
- `/intake` - Intake page. Shows voice and document intake components, plus the job spec confirmation panel.
- `/calls` - Calls page. Loads the confirmed job spec from browser storage and begins quote collection from the company directory.
- `/negotiate` - Negotiation page. Requires previously stored quotes and negotiation result; otherwise it redirects back to `/calls`.
- `/report` - Report page. Requires final quote and negotiation data; otherwise it redirects back to `/calls`.

## Data flow and storage

The prototype stores its state in browser `localStorage` keys:

- `negotiator_job_spec` - confirmed move scope
- `negotiator_quotes` - received quote data from calls
- `negotiator_negotiation` - final negotiation result

There is no database in this hackathon demo.

## Backend endpoints

- `POST /api/intake/parse-document` - accepts an uploaded image and returns extracted `job_spec` JSON.
- `POST /api/report/generate` - accepts `job_spec`, `quotes`, and `negotiation_result` to create a structured report.

## Required environment variables

Copy `.env.local.example` to `.env.local` and fill in the required values:

- `ELEVENLABS_API_KEY`
- `ELEVENLABS_INTAKE_AGENT_ID`
- `ELEVENLABS_NEGOTIATOR_AGENT_ID`
- `ELEVENLABS_STONEWALL_AGENT_ID`
- `ELEVENLABS_UPSELL_AGENT_ID`
- `ELEVENLABS_FAIRPRICE_AGENT_ID`
- `ANTHROPIC_API_KEY`
- `NEXT_PUBLIC_ELEVENLABS_INTAKE_AGENT_ID`
- `NEXT_PUBLIC_APP_URL`

## Run locally

1. Copy `.env.local.example` to `.env.local` and add the required keys and agent IDs.
2. Run `npm install`.
3. Run `npm run dev`.

## Notes

- Live quote calls require ElevenLabs phone dialing setup and valid outbound/recipient numbers.
- Document upload currently supports browser image types; PDF/HEIC conversion is not enabled in this prototype.
- The negotiation page only proceeds when enough verified quotes exist, ensuring the demo uses actual quote evidence.
