import { NextRequest, NextResponse } from 'next/server';
import { buildJobScopedConfig, getVerticalConfig, inferVertical, validateConfig, verticalRegistry, type FieldType, type VerticalConfig, type VerticalField } from '@/lib/verticals';
import { generateGeminiJson, hasGemini } from '@/lib/gemini';

const supportedVerticals = Object.values(verticalRegistry).map((config) => ({ id: config.id, display_name: config.displayName, summary: config.summary }));
const fieldSchema = { type: 'object', additionalProperties: false, required: ['key', 'label', 'type', 'required', 'options'], properties: { key: { type: 'string', maxLength: 48 }, label: { type: 'string', maxLength: 80 }, type: { type: 'string', enum: ['text', 'textarea', 'number', 'boolean', 'select'] }, required: { type: 'boolean' }, options: { type: 'array', items: { type: 'string', maxLength: 60 }, maxItems: 8 } } };
const classificationSchema = { type: 'object', additionalProperties: false, required: ['vertical_id', 'display_name', 'summary', 'confidence', 'reason', 'intake_fields', 'discovery_query'], properties: { vertical_id: { type: 'string', maxLength: 48 }, display_name: { type: 'string', maxLength: 80 }, summary: { type: 'string', maxLength: 280 }, confidence: { type: 'number', minimum: 0, maximum: 1 }, reason: { type: 'string', maxLength: 240 }, intake_fields: { type: 'array', items: fieldSchema, minItems: 3, maxItems: 12 }, discovery_query: { type: 'string', maxLength: 180 } } };

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { description?: string; vertical_id?: string };
    const description = body.description?.trim();
    if (!description || description.length < 8) return NextResponse.json({ error: 'Please describe the service you need priced.' }, { status: 422 });

    let config = body.vertical_id ? getVerticalConfig(body.vertical_id) : undefined;
    let confidence = config ? 1 : 0.55;
    let reason = config ? 'You selected this vertical.' : 'Matched from the service description.';
    let source = config ? 'user_selected' : 'local_fallback';

    if (!config && hasGemini()) {
      const result = await generateGeminiJson<{ vertical_id: string; display_name: string; summary: string; confidence: number; reason: string; intake_fields: VerticalField[]; discovery_query: string }>({
        system: 'Return only a JSON object matching the supplied schema. Build a minimal, privacy-preserving configuration for comparable vendor estimates.',
        prompt: `Classify this phone-priced service request. Prefer one of these approved profiles when it fits: ${JSON.stringify(supportedVerticals)}. Otherwise create a small job-scoped configuration with only the minimum facts a vendor needs to give a comparable estimate. Do not include sensitive data, payment details, or fields that the customer did not need to discuss. The discovery query must include a location placeholder from an intake field, such as {{service_location}}.\n\nREQUEST: ${description}`,
        schema: classificationSchema,
      });
      config = getVerticalConfig(result.vertical_id) ?? buildJobScopedConfig({ id: result.vertical_id, displayName: result.display_name, summary: result.summary, intakeFields: result.intake_fields.map((field) => ({ ...field, type: field.type as FieldType })), discoveryQuery: result.discovery_query });
      confidence = result.confidence; reason = result.reason; source = 'gemini';
    }

    config ??= inferVertical(description);
    const validConfig = validateConfig(config);
    if (!validConfig) return NextResponse.json({ error: 'The proposed vertical configuration was invalid.' }, { status: 422 });
    return NextResponse.json({ config: validConfig as VerticalConfig, confidence, reason, source });
  } catch (error) {
    console.error('Vertical classification failed', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not classify the request.' }, { status: 500 });
  }
}
