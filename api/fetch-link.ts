import type { VercelRequest, VercelResponse } from '@vercel/node';

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–');
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { url } = req.body || {};
  const rawUrl = (url || '').trim();

  if (!rawUrl) {
    return res.status(400).json({ success: false, message: 'URL is required' });
  }

  const isInstagram = rawUrl.includes('instagram.com') || rawUrl.includes('instagr.am');
  const isLinkedIn = rawUrl.includes('linkedin.com');
  const platform = isInstagram ? 'instagram' : isLinkedIn ? 'linkedin' : 'unknown';

  if (!isInstagram && !isLinkedIn) {
    return res.json({
      success: false,
      platform: 'unknown',
      url: rawUrl,
      message: 'Unsupported link. Please provide an Instagram Reel or LinkedIn post URL.'
    });
  }

  try {
    if (isInstagram) {
      try {
        const oembedUrl = `https://api.instagram.com/oembed/?url=${encodeURIComponent(rawUrl)}`;
        const oembedRes = await fetch(oembedUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' },
          signal: AbortSignal.timeout(4000)
        });
        if (oembedRes.ok) {
          const oembedData: any = await oembedRes.json();
          if (oembedData && (oembedData.title || oembedData.author_name)) {
            const extractedCaption = oembedData.title || '';
            if (extractedCaption.trim().length > 15) {
              return res.json({
                success: true,
                platform: 'instagram',
                url: rawUrl,
                caption: decodeHtmlEntities(extractedCaption),
                title: oembedData.title,
                author: oembedData.author_name
              });
            }
          }
        }
      } catch {
        // Fallback
      }
    }

    const pageRes = await fetch(rawUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      signal: AbortSignal.timeout(5000)
    });

    if (!pageRes.ok) {
      return res.json({
        success: false,
        partial: true,
        platform,
        url: rawUrl,
        message: `Couldn't fetch caption automatically (${pageRes.status}) — please paste it below manually.`
      });
    }

    const html = await pageRes.text();
    const ogDescMatch = html.match(/<meta\s+(?:property|name)=["'](?:og:description|description|twitter:description)["']\s+content=["'](.*?)["']/i) ||
                        html.match(/<meta\s+content=["'](.*?)["']\s+(?:property|name)=["'](?:og:description|description|twitter:description)["']/i);
    
    let captionText = ogDescMatch ? ogDescMatch[1] : '';
    if (isInstagram && captionText) {
      const matchQuote = captionText.match(/:\s*["“](.*)["”]?$/s);
      if (matchQuote && matchQuote[1]) {
        captionText = matchQuote[1];
      }
    }

    captionText = decodeHtmlEntities(captionText.trim());

    if (captionText && captionText.length > 10 && !captionText.includes('Log In') && !captionText.includes('Sign in')) {
      return res.json({
        success: true,
        platform,
        url: rawUrl,
        caption: captionText
      });
    }

    return res.json({
      success: false,
      partial: true,
      platform,
      url: rawUrl,
      message: `Direct caption preview is protected by ${isInstagram ? 'Instagram' : 'LinkedIn'}. Paste your final caption below manually.`
    });
  } catch (err: any) {
    return res.json({
      success: false,
      partial: true,
      platform,
      url: rawUrl,
      message: `Couldn't auto-fetch: ${err.message || 'Network timeout'}. Please paste your caption manually below.`
    });
  }
}
