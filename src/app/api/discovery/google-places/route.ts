import { NextRequest, NextResponse } from 'next/server';
import type { VerticalConfig } from '@/lib/verticals';

type PlaceResult = { place_id: string; name: string; phone_number?: string; address?: string; rating?: number; maps_url?: string; query: string };

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { config?: VerticalConfig; values?: Record<string, unknown> };
    if (!body.config || !body.values) return NextResponse.json({ error: 'A confirmed vertical configuration and intake values are required.' }, { status: 400 });
    const values = body.values;
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) return NextResponse.json({ error: 'GOOGLE_MAPS_API_KEY is not configured. Add it to enable real business discovery.' }, { status: 503 });

    const resolve = (template: string) => template.replace(/{{([a-z0-9_]+)}}/gi, (_, key: string) => String(values[key] ?? '').trim());
    const queries = body.config.discoveryQueries.map(resolve).filter((query) => query.length > 4).slice(0, 2);
    if (!queries.length) return NextResponse.json({ error: 'The confirmed brief is missing the location needed for discovery.' }, { status: 422 });

    const results: PlaceResult[] = [];
    for (const query of queries) {
      const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': apiKey, 'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.rating,places.googleMapsUri' },
        body: JSON.stringify({ textQuery: query, pageSize: 10 }),
      });
      if (!response.ok) {
        const details = await response.text();
        throw new Error(`Google Places returned ${response.status}: ${details.slice(0, 700)}`);
      }
      const payload = await response.json() as { places?: Array<{ id: string; displayName?: { text?: string }; formattedAddress?: string; nationalPhoneNumber?: string; rating?: number; googleMapsUri?: string }> };
      for (const place of payload.places ?? []) {
        if (!place.id || results.some((item) => item.place_id === place.id)) continue;
        results.push({ place_id: place.id, name: place.displayName?.text ?? 'Unnamed business', phone_number: place.nationalPhoneNumber, address: place.formattedAddress, rating: place.rating, maps_url: place.googleMapsUri, query });
      }
    }
    return NextResponse.json({ vendors: results.slice(0, 10), source: 'google_places', queries });
  } catch (error) {
    console.error('Google Places discovery failed', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Could not discover businesses.' }, { status: 502 });
  }
}
