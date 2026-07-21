import { execFile } from 'child_process';
import { writeFile, unlink } from 'fs/promises';
import { tmpdir } from 'os';
import path from 'path';
import { promisify } from 'util';
import { NextRequest, NextResponse } from 'next/server';
import { recognize } from 'tesseract.js';
import type { VerticalConfig } from '@/lib/verticals';
import { cerebrasClient, cerebrasModel, hasCerebras } from '@/lib/cerebras';

const execFileAsync = promisify(execFile);
const extractedSchema = { type: 'object', additionalProperties: false, required: ['values'], properties: { values: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['key', 'value'], properties: { key: { type: 'string' }, value: { type: 'string' } } } } } };

function coerce(value: string, type: string): string | number | boolean {
  if (type === 'boolean') return /^(true|yes|required|included)$/i.test(value.trim());
  if (type === 'number') { const number = Number(value.replace(/,/g, '')); return Number.isFinite(number) ? number : value; }
  return value;
}

export async function POST(request: NextRequest) {
  let temporaryFile = '';
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const configRaw = formData.get('config');
    if (!(file instanceof File) || typeof configRaw !== 'string') return NextResponse.json({ error: 'A PDF/PNG document and vertical configuration are required.' }, { status: 400 });
    const config = JSON.parse(configRaw) as VerticalConfig;
    if (file.type !== 'application/pdf' && file.type !== 'image/png') return NextResponse.json({ error: 'Upload a PDF or PNG document.' }, { status: 422 });
    const bytes = Buffer.from(await file.arrayBuffer());
    let sourceText = '';
    if (file.type === 'application/pdf') {
      temporaryFile = path.join(tmpdir(), `negotiator-${crypto.randomUUID()}.pdf`);
      await writeFile(temporaryFile, bytes);
      const script = path.join(process.cwd(), 'scripts', 'document_parser.py');
      const { stdout } = await execFileAsync('python', [script, temporaryFile]);
      sourceText = (JSON.parse(stdout) as { text?: string }).text ?? '';
    } else sourceText = (await recognize(bytes, 'eng')).data.text;
    const values: Record<string, string | number | boolean> = {};
    if (hasCerebras() && sourceText) {
      const response = await cerebrasClient().chat.completions.create({
        model: cerebrasModel(), max_tokens: 1400, reasoning_effort: 'low',
        messages: [
          { role: 'developer', content: 'Return only a JSON object matching the supplied schema. Extract only literal facts; omit fields not present and never infer.' },
          { role: 'user', content: `Extract only facts explicitly present in this document into the configured job fields. Return values as strings. Omit a key if it is not present. Do not infer.\n\nCONFIGURED FIELDS: ${JSON.stringify(config.intakeFields)}\n\nDOCUMENT TEXT:\n${sourceText.slice(0, 12000)}` },
        ],
        response_format: { type: 'json_schema', json_schema: { name: 'document_job_spec', strict: true, schema: extractedSchema } },
      });
      const content = response.choices[0]?.message.content;
      if (!content) throw new Error('Cerebras returned no document extraction.');
      const extracted = JSON.parse(content) as { values: Array<{ key: string; value: string }> };
      for (const item of extracted.values) {
        const field = config.intakeFields.find((candidate) => candidate.key === item.key);
        if (field && item.value.trim()) values[field.key] = coerce(item.value, field.type);
      }
    }
    return NextResponse.json({ values, source_text: sourceText.slice(0, 2000), source: hasCerebras() ? 'cerebras' : 'text_extracted_only' });
  } catch (error) {
    console.error('Generic document normalization failed', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not parse this document.' }, { status: 422 });
  } finally { if (temporaryFile) await unlink(temporaryFile).catch(() => undefined); }
}
