// Vercel serverless endpoint for translating UI labels only.
export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(503).json({ error: 'AI translation is not configured' });
  const texts = req.body?.texts;
  if (!Array.isArray(texts) || texts.length > 40 || texts.some((x: unknown) => typeof x !== 'string' || x.length > 300)) {
    return res.status(400).json({ error: 'Invalid translation request' });
  }
  if (texts.length === 0) return res.status(200).json({ translations: [] });
  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=' + encodeURIComponent(apiKey), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: 'Translate Indonesian user-interface text into natural concise English for a small-business finance app. Return only a JSON array of strings in the same order and same length. Preserve numbers, currency amounts, product names, personal names, IDs, and placeholders exactly. Do not explain. If a string is not Indonesian UI text, return it unchanged.' }] },
        contents: [{ role: 'user', parts: [{ text: JSON.stringify(texts) }] }],
        generationConfig: { responseMimeType: 'application/json', temperature: 0.1 }
      })
    });
    if (!response.ok) return res.status(502).json({ error: 'Translation provider unavailable' });
    const payload = await response.json();
    const raw = payload?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || '').join('') || '[]';
    const translations = JSON.parse(raw);
    if (!Array.isArray(translations) || translations.length !== texts.length || translations.some((x: unknown) => typeof x !== 'string')) {
      return res.status(502).json({ error: 'Invalid translation response' });
    }
    return res.status(200).json({ translations: translations.map((value: string, i: number) => value.slice(0, 600) || texts[i]) });
  } catch {
    return res.status(502).json({ error: 'Translation failed' });
  }
}
