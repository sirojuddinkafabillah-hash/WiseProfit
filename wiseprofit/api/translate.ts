// Vercel serverless endpoint for DeepL Indonesian-to-English UI translation.
// DEEPL_API_KEY stays on the server and is never exposed to browser code.
export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.DEEPL_API_KEY;
  if (!apiKey) {
    return res.status(503).json({ error: 'Translation is not configured: DEEPL_API_KEY is missing.' });
  }

  const texts = req.body?.texts;
  if (!Array.isArray(texts) || texts.length > 40 ||
      texts.some((x: unknown) => typeof x !== 'string' || x.length > 300)) {
    return res.status(400).json({ error: 'texts must be an array of at most 40 strings, each no longer than 300 characters.' });
  }
  if (texts.length === 0) return res.status(200).json({ translations: [] });

  // Free API keys use api-free.deepl.com. Set DEEPL_API_URL to
  // https://api.deepl.com/v2/translate for a DeepL Pro key.
  const endpoint = process.env.DEEPL_API_URL || 'https://api-free.deepl.com/v2/translate';
  const body = new URLSearchParams();
  body.set('auth_key', apiKey);
  body.set('source_lang', 'ID');
  body.set('target_lang', 'EN');
  body.set('preserve_formatting', '1');
  texts.forEach((value: string) => body.append('text', value));

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString()
      });

      if (!response.ok) {
        const message = (await response.text()).slice(0, 1000);
        console.error('DeepL translation API error', { status: response.status, message });
        if (attempt === 0 && (response.status === 429 || response.status === 503)) continue;
        return res.status(502).json({ error: 'Translation provider request failed', providerStatus: response.status });
      }

      const payload = await response.json();
      const items = payload?.translations;
      if (!Array.isArray(items) || items.length !== texts.length ||
          items.some((item: any) => typeof item?.text !== 'string')) {
        console.error('DeepL translation response validation error', {
          status: 502,
          message: `Expected ${texts.length} translated strings in response.`
        });
        return res.status(502).json({ error: 'Invalid translation response' });
      }

      return res.status(200).json({
        translations: items.map((item: any, index: number) => item.text.trim() || texts[index])
      });
    } catch (error: any) {
      console.error('DeepL translation exception', {
        status: 502,
        message: String(error?.message || error).slice(0, 1000)
      });
      return res.status(502).json({ error: 'Translation request failed' });
    }
  }

  return res.status(502).json({ error: 'Translation provider unavailable' });
}
