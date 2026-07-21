type GeminiSchema = Record<string, unknown>;

export function hasGemini(): boolean {
  return Boolean(process.env.GEMINI_API_KEY?.trim());
}

export function geminiModel(): string {
  return process.env.GEMINI_MODEL?.trim() || 'gemini-2.5-flash';
}

function supportedSchema(schema: unknown): unknown {
  if (Array.isArray(schema)) return schema.map(supportedSchema);
  if (!schema || typeof schema !== 'object') return schema;
  const record = schema as Record<string, unknown>;
  return Object.fromEntries(Object.entries(record)
    .filter(([key]) => key !== 'additionalProperties')
    .map(([key, value]) => [key, supportedSchema(value)]));
}

export async function generateGeminiJson<T>({ system, prompt, schema }: { system: string; prompt: string; schema: GeminiSchema }): Promise<T> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured.');
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${geminiModel()}:generateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json', responseSchema: supportedSchema(schema), temperature: 0.1 },
    }),
  });
  if (!response.ok) throw new Error(`Gemini returned ${response.status}: ${(await response.text()).slice(0, 500)}`);
  const payload = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
  const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('').trim();
  if (!text) throw new Error('Gemini returned no structured JSON content.');
  return JSON.parse(text) as T;
}
