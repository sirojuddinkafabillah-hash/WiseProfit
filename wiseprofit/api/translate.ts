// Vercel serverless endpoint for translating UI labels with DeepL.
// Keep the API key on the server; never expose it to browser code.
export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.DEEPL_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: 'DeepL translation is not configured. Add DEEPL_API_KEY to Vercel environment variables.'
    });
  }

  const texts = req.body?.texts;
  if (!Array.isArray(texts) || texts.length > 40 ||
      texts.some((x: unknown) => typeof x !== 'string' || x.length > 300)) {
    return res.status(400).json({ error: 'Invalid translation request' });
  }
  if (texts.length === 0) return res.status(200).json({ translations: [] });

  // Set DEEPL_API_URL to https://api.deepl.com/v2/translate for DeepL API Pro.
  const endpoint = process.env.DEEPL_API_URL || 'https://api-free.deepl.com/v2/translate';

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `DeepL-Auth-Key ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: texts,
        source_lang: 'ID',
        target_lang: 'EN',
        preserve_formatting: true
      })
    });

    if (!response.ok) {
      const providerText = (await response.text()).slice(0, 300);
      console.error('DeepL translation API error', response.status, providerText);
      return res.status(502).json({
        error: 'DeepL API request failed',
        providerStatus: response.status
      });
    }

    const payload = await response.json();
    const translated = payload?.translations;
    if (!Array.isArray(translated) || translated.length !== texts.length ||
        translated.some((item: any) => typeof item?.text !== 'string')) {
      console.error('DeepL returned an invalid translation response');
      return res.status(502).json({ error: 'Invalid translation response from DeepL' });
    }

    return res.status(200).json({
      translations: translated.map((item: any, i: number) => item.text.slice(0, 600) || texts[i])
    });
  } catch (error: any) {
    console.error('DeepL translation exception', String(error?.message || error).slice(0, 300));
    return res.status(502).json({ error: 'Translation failed' });
  }
}
