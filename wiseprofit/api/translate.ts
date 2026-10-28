// Vercel serverless endpoint for Gemini-powered Indonesian-to-English UI translation.
// GEMINI_API_KEY stays on the server and is never exposed to browser code.
export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'Translation is not configured: GEMINI_API_KEY is missing.' });

  const texts = req.body?.texts;
  if (!Array.isArray(texts) || texts.length > 40 ||
      texts.some((x: unknown) => typeof x !== 'string' || x.length > 300)) {
    return res.status(400).json({ error: 'texts must be an array of at most 40 strings, each no longer than 300 characters.' });
  }
  if (texts.length === 0) return res.status(200).json({ translations: [] });

  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const prompt = [
    'Translate each UI string from Indonesian to natural, concise English.',
    'Return ONLY a valid JSON array of strings, exactly the same number and order as the input.',
    'Preserve all numbers, dates, currency amounts and formatting exactly.',
    'Never translate or alter product names, personal names, brand names, email addresses, IDs, codes, URLs, or account data.',
    'Do not add explanations or markdown.',
    'Input JSON array:',
    JSON.stringify(texts)
  ].join('\n');

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1, responseMimeType: 'application/json' }
        })
      });

      if (!response.ok) {
        const message = (await response.text()).slice(0, 1000);
        console.error('Gemini translation API error', { status: response.status, message });
        if (attempt === 0 && (response.status === 429 || response.status === 503)) continue;
        return res.status(502).json({ error: 'Translation provider request failed', providerStatus: response.status });
      }

      const payload = await response.json();
      const raw = payload?.candidates?.[0]?.content?.parts?.map((part: any) => part?.text || '').join('').trim();
      let translations: unknown;
      try {
        translations = JSON.parse(raw);
      } catch {
        console.error('Gemini translation response parse error', { status: 502, message: String(raw || '').slice(0, 800) });
        return res.status(502).json({ error: 'Invalid translation response' });
      }

      if (!Array.isArray(translations) || translations.length !== texts.length ||
          translations.some((value: unknown) => typeof value !== 'string')) {
        console.error('Gemini translation response validation error', { status: 502, message: `Expected ${texts.length} strings in response.` });
        return res.status(502).json({ error: 'Invalid translation response' });
      }

      return res.status(200).json({
        translations: translations.map((value: string, index: number) => value.trim() || texts[index])
      });
    } catch (error: any) {
      console.error('Gemini translation exception', { status: 502, message: String(error?.message || error).slice(0, 1000) });
      return res.status(502).json({ error: 'Translation request failed' });
    }
  }
  return res.status(502).json({ error: 'Translation provider unavailable' });
}
