import { execFile } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink } from 'fs/promises';
import { tmpdir } from 'os';
import path from 'path';
import { NextRequest, NextResponse } from 'next/server';
import { recognize } from 'tesseract.js';
import type { DocumentParseResponse, JobSpec } from '@/lib/types';

export const runtime = 'nodejs';
const execFileAsync = promisify(execFile);

function missingFields(spec: Partial<JobSpec>): string[] {
  const required: Array<keyof JobSpec> = ['wedding_date', 'venue', 'events', 'coverage_type'];
  return required.filter((key) => {
    const value = spec[key];
    if (value === undefined || value === null || value === '' || (typeof value === 'number' && value === 0)) return true;
    if (key === 'venue') { const venue = value as JobSpec['venue']; return !venue.name || !venue.city; }
    return Array.isArray(value) && value.length === 0;
  }).map(String);
}

function mapText(text: string): Partial<JobSpec> {
  const date = text.match(/\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{4})\b/i)?.[0] ?? '';
  const venue = text.match(/^\s*(?:venue|location)\s*[:\-]\s*(.+)$/im)?.[1]?.trim() ?? '';
  const city = text.match(/^\s*city\s*[:\-]\s*(.+)$/im)?.[1]?.trim() ?? '';
  const eventNames = ['Haldi', 'Mehendi', 'Sangeet', 'Wedding Ceremony', 'Wedding', 'Reception'];
  const events = eventNames.filter((name) => new RegExp(`\\b${name}\\b`, 'i').test(text)).map((name) => ({ name, coverage_hours: 0 }));
  return { wedding_date: date, venue: { name: venue, city }, events, coverage_type: /videography|video/i.test(text) ? 'photography_plus_videography' : 'photography_only', drone_coverage_required: /drone/i.test(text), albums_required: /album/i.test(text), special_requests: [] };
}

export async function POST(request: NextRequest) {
  let temporaryFile = '';
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    if (file.type !== 'application/pdf' && file.type !== 'image/png') return NextResponse.json({ error: 'Upload a wedding invitation or existing quote as PDF or PNG.' }, { status: 422 });
    const bytes = Buffer.from(await file.arrayBuffer());
    let spec: Partial<JobSpec>;
    let sourceText = '';
    if (file.type === 'application/pdf') {
      temporaryFile = path.join(tmpdir(), `negotiator-${crypto.randomUUID()}.pdf`);
      await writeFile(temporaryFile, bytes);
      const script = path.join(process.cwd(), 'scripts', 'document_parser.py');
      const { stdout } = await execFileAsync('python', [script, temporaryFile]);
      const result = JSON.parse(stdout) as { job_spec: Partial<JobSpec>; text: string };
      spec = { ...result.job_spec, intake_method: 'document' };
      sourceText = result.text;
    } else {
      const result = await recognize(bytes, 'eng');
      sourceText = result.data.text;
      spec = mapText(sourceText);
    }
    const missing = missingFields(spec);
    const body: DocumentParseResponse = { success: true, job_spec: spec, confidence: missing.length === 0 ? 'high' : missing.length < 3 ? 'medium' : 'low', missing_fields: missing, extraction_evidence: sourceText ? [{ field: 'source_text', source_text: sourceText.slice(0, 500) }] : [] };
    return NextResponse.json(body);
  } catch (error) {
    console.error('Document parsing failed', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not parse document' }, { status: 422 });
  } finally {
    if (temporaryFile) await unlink(temporaryFile).catch(() => undefined);
  }
}
